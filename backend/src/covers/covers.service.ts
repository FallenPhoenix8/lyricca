import { Injectable } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { v7 as uuid } from "uuid"
import { DatabaseService } from "../database/database.service"
import { CoverDTOImpl, CoverUpdateDTOImpl } from "./dto/cover-dto"
import { ImageService } from "../image/image.service"

@Injectable()
export class CoversService {
  private readonly bucketName = "covers"
  private readonly searchAPIURL = "https://musicbrainz.org/"

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
    artist,
    title,
    userAgent,
  }: {
    artist: string
    title: string
    userAgent: string
  }): Promise<URL | null> {
    const recordingSearchURL = this.getSuggestionSearchURL(
      artist,
      title,
      "recording",
    )
    let coverURL = await this.getSuggestionCoverURL(
      recordingSearchURL,
      userAgent,
    )
    if (!coverURL) {
      const releaseSearchURL = this.getSuggestionSearchURL(
        artist,
        title,
        "release",
      )
      coverURL = await this.getSuggestionCoverURL(releaseSearchURL, userAgent)
    }

    return coverURL
  }

  private getSuggestionSearchURL(
    artist: string,
    title: string,
    type: "recording" | "release" = "recording",
  ): URL {
    // * MARK: - Build Lucene query
    const queryParts: string[] = [
      `recording:"${title.toLowerCase()}"`,
      `artist:"${artist.toLowerCase()}"`,
    ]
    const query = encodeURIComponent(queryParts.join(" AND "))

    // * MARK: - Build search URL
    const url = new URL(
      `ws/2/${type}/?query=${query}&fmt=json`,
      this.searchAPIURL,
    )
    return url
  }

  private async getSuggestionCoverURL(
    searchURL: URL,
    userAgent: string,
  ): Promise<URL | null> {
    try {
      const response = await fetch(searchURL, {
        headers: {
          "User-Agent": userAgent,
        },
      })
      const data = await response.json()
      //* MARK: - Get the MBID of the first release associated with this recording.
      // Recordings don't have images directly; their "Releases" (albums/singles) do.
      // If there is no release, then return null to indicate that no cover has been found.
      const firstRelease = data.recordings?.[0]?.releases?.[0]

      if (!firstRelease || !firstRelease.id) {
        return null
      }
      const suggestedCoverURL = new URL(
        `https://coverartarchive.org/release/${firstRelease.id}/front`,
      )
      return suggestedCoverURL
    } catch (error) {
      console.error("Failed to get cover suggestion URL:", error)
      return null
    }
  }
}
