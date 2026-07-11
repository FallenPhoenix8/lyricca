import { Injectable, Logger } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { v7 as uuid } from "uuid"
import { DatabaseService } from "../database/database.service"
import { CoverDTOImpl } from "./dto/cover-dto"
import { ImageService } from "../image/image.service"

@Injectable()
export class CoversService {
  private readonly bucketName = "covers"
  private readonly logger = new Logger(CoversService.name)

  private readonly lyriccaStableUserAgent = `Lyricca/1.0 (+${process.env.FRONTEND_URL}; lukw8@proton.me)`

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

  /**
   * Retrieves a cover art URL from Apple Music.
   * @param title - The song title.
   * @param artist - The song artist.
   * @param album - The song album.
   * @param userAgent - The user agent string.
   * @returns The cover art URL, or null if no cover art was found.
   */
  private async getAppleArtworkURL({
    title,
    artist,
    album,
  }: {
    title: string
    artist: string | null
    album: string | null
  }): Promise<URL | null> {
    const queryParts: string[] = []

    if (artist) {
      queryParts.push(artist)
    }

    if (album) {
      queryParts.push(album)
    } else {
      queryParts.push(title)
    }

    const query = queryParts.join(" ")

    const url = new URL("https://itunes.apple.com/search")
    url.searchParams.set("term", query)
    url.searchParams.set("media", "music")
    url.searchParams.set("entity", album ? "album" : "song")
    url.searchParams.set("limit", "5")

    const response = await fetch(url, {
      headers: {
        "user-agent": this.lyriccaStableUserAgent,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      results?: Array<{
        artworkUrl100?: string
        collectionName?: string
        trackName?: string
        artistName?: string
      }>
    }

    const result = data.results?.[0]

    if (!result?.artworkUrl100) {
      return null
    }

    // Apple usually exposes larger variants by changing the size.
    const largerArtworkURL = result.artworkUrl100
      .replace("100x100bb", "600x600bb")
      .replace("100x100", "600x600")

    this.logger.log("Suggestion URL retrieved from Apple Music successfully.")
    return new URL(largerArtworkURL)
  }

  /**
   * Retrieves a cover art URL from DuckDuckGo.
   * @param title - The song title.
   * @param artist - The song artist.
   * @param album - The song album.
   * @param userAgent - The user agent string.
   * @returns The cover art URL, or null if no cover art was found.
   */
  private async getDuckDuckGoSuggestionURL({
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
    const query = [title, artist, album, "cover art"].filter(Boolean).join(" ")

    const searchURL = new URL("https://duckduckgo.com/")
    searchURL.searchParams.set("q", query)
    searchURL.searchParams.set("iax", "images")
    searchURL.searchParams.set("ia", "images")

    let htmlResponse: Response | null = null
    try {
      htmlResponse = await fetch(searchURL, {
        headers: {
          "user-agent": userAgent,
          accept: "text/html",
        },
        signal: AbortSignal.timeout(10_000),
      })

      if (!htmlResponse.ok) {
        return null
      }
    } catch {
      return null
    }
    if (!htmlResponse) {
      return null
    }
    const html = await htmlResponse.text()

    /**
     * DuckDuckGo requires a temporary `vqd` token when calling its image JSON endpoint.
     *
     * The first request to `https://duckduckgo.com/?q=...` returns an HTML page that
     * contains this token somewhere inside the page source, usually in one of these forms:
     *
     *   vqd=abc123
     *   vqd='abc123'
     *   vqd="abc123"
     *
     * This regex searches the HTML for `vqd=...` and captures only the token value.
     *
     * Regex breakdown:
     * - `vqd=`          finds the text "vqd="
     * - `['"]?`        allows an optional opening quote: ' or "
     * - `([^'"\s&]+)`  captures the token until a quote, whitespace, or `&`
     * - `['"]?`        allows an optional closing quote
     *
     * After `match()`, index 0 is the full matched text and index 1 is the captured token.
     *
     * Example:
     *   html:      `<script>var vqd='4-123abc';</script>`
     *   match[0]:  `vqd='4-123abc'`
     *   match[1]:  `4-123abc`
     */
    const vqdMatch = html.match(/vqd=['"]?([^'"\s&]+)['"]?/)

    if (!vqdMatch?.[1]) {
      return null
    }

    const apiURL = new URL("https://duckduckgo.com/i.js")
    apiURL.searchParams.set("q", query)
    apiURL.searchParams.set("vqd", vqdMatch[1])
    apiURL.searchParams.set("o", "json")
    apiURL.searchParams.set("l", "us-en")
    apiURL.searchParams.set("p", "1")

    let imageResponse: Response | null = null
    try {
      imageResponse = await fetch(apiURL, {
        headers: {
          "user-agent": userAgent,
          referer: searchURL.toString(),
          accept: "application/json",
        },
        signal: AbortSignal.timeout(10_000),
      })

      if (!imageResponse.ok) {
        return null
      }
    } catch {
      return null
    }

    const data = (await imageResponse.json()) as {
      results?: Array<{
        image?: string
        thumbnail?: string
        title?: string
        url?: string
      }>
    }

    const imageURL = data.results?.find((result) => result.image)?.image

    if (!imageURL) {
      return null
    }

    try {
      const parsedURL = new URL(imageURL)

      if (!["http:", "https:"].includes(parsedURL.protocol)) {
        return null
      }

      this.logger.log("Suggestion URL retrieved from DuckDuckGo successfully.")
      return parsedURL
    } catch {
      return null
    }
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
    const duckDuckGoResult = await this.getDuckDuckGoSuggestionURL({
      title,
      artist,
      album,
      userAgent,
    })

    if (duckDuckGoResult) {
      this.logger.log("Suggestion URL retrieved from DuckDuckGo successfully.")
      return duckDuckGoResult
    } else {
      this.logger.warn(
        "Failed to retrieve suggestion URL from DuckDuckGo, falling back to Apple Music...",
      )
    }

    const appleResult = await this.getAppleArtworkURL({
      title,
      artist,
      album,
    })
    if (appleResult) {
      this.logger.log("Suggestion URL retrieved from Apple Music successfully.")
      return appleResult
    } else {
      this.logger.warn("Failed to retrieve suggestion URL from Apple Music.")
    }

    this.logger.error("Failed to retrieve cover suggestion URL")
    return null
  }
}
