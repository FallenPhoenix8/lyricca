import { Injectable, Logger } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { v7 as uuid } from "uuid"
import { DatabaseService } from "../database/database.service"
import { CoverDTOImpl, CoverUpdateDTOImpl } from "./dto/cover-dto"
import { ImageService } from "../image/image.service"
import puppeteer, { Browser, Page } from "puppeteer-core"
import chromium from "@sparticuz/chromium"

@Injectable()
export class CoversService {
  private readonly bucketName = "covers"
  private readonly searchEngineBaseURL = "https://duckduckgo.com/"
  private readonly logger = new Logger(CoversService.name)
  private browser: Browser | null = null
  private browserWSEndpoint: string | null = null

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly databaseService: DatabaseService,
    private readonly imageService: ImageService,
  ) {}

  async create(file: File) {
    const fileExtension = file.name.split(".").pop()
    const fileName = uuid()
    const filePath = `${fileName}.${fileExtension}`

    const uploadedFile = await this.supabaseService.storage
      .from(this.bucketName)
      .upload(filePath, file)

    if (uploadedFile.error) {
      throw new Error(`Failed to upload file: ${uploadedFile.error.message}`)
    }

    const {
      data: { publicUrl },
    } = this.supabaseService.storage
      .from(this.bucketName)
      .getPublicUrl(uploadedFile.data.path)

    const cover = await this.databaseService.cover.create({
      data: {
        url: publicUrl,
      },
    })

    return new CoverDTOImpl(cover)
  }

  async findOne(props: { id: string }): Promise<CoverDTOImpl | null> {
    const cover = await this.databaseService.cover.findUnique({
      where: { id: props.id },
    })
    if (!cover) {
      return null
    }
    return new CoverDTOImpl(cover)
  }

  async remove(id: string): Promise<CoverDTOImpl> {
    //* MARK: - Remove cover from database
    const cover = await this.databaseService.cover.delete({
      where: { id },
    })

    //* MARK: - Remove cover from storage
    let path = cover.url.split(this.bucketName)[1]
    path = path.startsWith("/") ? path.slice(1) : path
    const { error } = await this.supabaseService.storage
      .from(this.bucketName)
      .remove([path])

    if (error) {
      throw new Error(`Failed to remove cover: ${error.message}`)
    }

    return new CoverDTOImpl(cover)
  }

  async getSuggestionURL({
    title,
    artist,
    album,
    userAgent,
  }: {
    title: string
    userAgent: string
    artist: string | null
    album: string | null
  }): Promise<URL | null> {
    const { browser, page } = await this.browserOpenEmptyPage(userAgent)

    try {
      const queryTechnicalParts: string[] = [
        `ia=images`,
        `t=h_`,
        `iax=images`,
        "origin=funnel_home_website_duckaihomepage_topbanner",
        "chip-select=images",
      ]

      let querySearch: string = `q=${encodeURIComponent(title)}`

      if (artist) {
        querySearch += `+${encodeURIComponent(artist)}`
      }

      if (album) {
        querySearch += `+${encodeURIComponent(album)}`
      }

      querySearch += "+song"

      const queryParams = queryTechnicalParts.join(`&`) + `&` + querySearch
      const searchURL = new URL(this.searchEngineBaseURL)
      searchURL.search = queryParams

      await page.goto(searchURL.toString(), {
        waitUntil: "networkidle2",
        timeout: 30_000,
      })

      await page.waitForSelector(`img[loading="lazy"]`, {
        timeout: 15_000,
      })

      const imageURL = await page.evaluate(() => {
        const imageElement = document.querySelector(
          `img[loading="lazy"]`,
        ) as HTMLImageElement | null

        return imageElement?.src ?? null
      })

      return imageURL ? new URL(imageURL) : null
    } finally {
      await page.close().catch(() => undefined)
      await browser.close().catch(() => undefined)
    }
  }
  private async browserOpenEmptyPage(userAgent: string): Promise<{
    browser: Browser
    page: Page
  }> {
    this.logger.log("Launching browser...")

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()

    await page.setUserAgent(userAgent)
    await page.setViewport({
      width: 1280,
      height: 720,
    })

    this.logger.log("Browser launched successfully.")

    return { browser, page }
  }
}
