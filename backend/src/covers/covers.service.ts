import { Injectable, Logger } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { v7 as uuid } from "uuid"
import { DatabaseService } from "../database/database.service"
import { CoverDTOImpl, CoverUpdateDTOImpl } from "./dto/cover-dto"
import { ImageService } from "../image/image.service"
import puppeteer, { Browser, Page } from "puppeteer"

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
    const page = await this.browserOpenEmptyPage(userAgent)
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

    await page.goto(searchURL.toString())

    await page.waitForSelector(`img[loading="lazy"]`)
    const imageURL = await page.evaluate(() => {
      const imageElement = document.querySelector(
        `img[loading="lazy"]`,
      ) as HTMLImageElement | null
      if (!imageElement) {
        return null
      }
      return imageElement.src
    })

    await page.close()
    return imageURL ? new URL(imageURL) : null
  }

  private async browserOpenEmptyPage(userAgent: string): Promise<Page> {
    if (!this.browser || !this.browserWSEndpoint) {
      this.logger.log("Launching browser...")
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      })
      this.browserWSEndpoint = this.browser.wsEndpoint()
      this.browser.disconnect()
      this.logger.log("Browser launched successfully.")
    }
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
    })
    const page = await browser.newPage()
    await page.setUserAgent(userAgent)
    await page.setViewport({
      width: 1280,
      height: 720,
    })

    return page
  }
}
