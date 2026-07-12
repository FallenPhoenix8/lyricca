import { Injectable, Logger } from "@nestjs/common"
import { DatabaseService } from "../database/database.service"
import {
  SongCheckAllInputImpl,
  SongCheckAllOutputImpl,
  SongCreateDTOImpl,
  SongImpl,
  SongUpdateDTOImpl,
} from "./dto/song-dto"
import { SongCreateDTO, SongUpdateDTO } from "@shared/ts-types"
import { CoverDTOImpl } from "../covers/dto/cover-dto"
import { Client as GeniusClient } from "genius-lyrics"

@Injectable()
export class SongsService {
  private readonly geniusLyricsClient: GeniusClient
  private readonly logger = new Logger(SongsService.name)
  constructor(private readonly databaseService: DatabaseService) {
    const geniusTokenSecret = process.env.GENIUS_TOKEN_SECRET
    if (!geniusTokenSecret) {
      throw new Error("GENIUS_TOKEN_SECRET environment variable is not set.")
    }
    this.geniusLyricsClient = new GeniusClient(geniusTokenSecret)
  }

  async create(
    createSongDto: SongCreateDTO & { user_id: string; cover_id?: string },
  ): Promise<SongImpl> {
    const song = await this.databaseService.song.create({
      data: {
        title: createSongDto.title,
        artist: createSongDto.artist,
        album: createSongDto.album,
        original_lyrics: createSongDto.original_lyrics,
        translated_lyrics: createSongDto.translated_lyrics,
        user_id: createSongDto.user_id,
        cover_id: createSongDto.cover_id,
      },
      include: { user: true, cover: true },
    })

    return new SongImpl(song)
  }

  async remove(id: string): Promise<SongImpl> {
    const song = await this.databaseService.song.delete({
      where: { id },
      include: { user: true, cover: true },
    })
    return new SongImpl(song)
  }

  async update(
    id: string,
    updateSongDto: SongUpdateDTOImpl & { cover_id?: string },
  ): Promise<SongImpl> {
    const updateData: SongUpdateDTO & { cover_id?: string } = {
      ...updateSongDto,
    }
    if (updateSongDto.artist !== undefined && !updateSongDto.artist?.trim()) {
      updateData.artist = null
    }
    if (updateSongDto.album !== undefined && !updateSongDto.album?.trim()) {
      updateData.album = null
    }
    const song = await this.databaseService.song.update({
      where: { id },
      data: {
        ...updateData,
      },
      include: { user: true, cover: true },
    })
    return new SongImpl(song)
  }

  async findOne(props: { id: string }): Promise<SongImpl | null> {
    const song = await this.databaseService.song.findUnique({
      where: { id: props.id },
      include: { user: true, cover: true },
    })
    if (!song) {
      return null
    }
    return new SongImpl(song)
  }

  async checkAll(
    input: SongCheckAllInputImpl,
    userId: string,
  ): Promise<SongCheckAllOutputImpl> {
    // * MARK: - Get all songs of the user
    const userSongsMap: Map<string, Date> = new Map(
      (
        await this.databaseService.song.findMany({
          where: { user_id: userId },
          include: { user: true, cover: true },
        })
      ).map((song) => [song.id, song.updated_at]),
    )
    // * Compare songs with input
    const inputSongsMap: Map<string, Date> = new Map(
      input.items.map((item) => [item.id, item.updated_at]),
    )
    let toBeUpdated: string[] = []
    let toBeCreated: string[] = []
    let toBeDeleted: string[] = []

    inputSongsMap.forEach((updatedAt, id) => {
      // Check if songs are missing in the database, then mark for deletion
      if (!userSongsMap.has(id)) {
        toBeDeleted.push(id)
        // Check if existing songs are up to date
      } else if (updatedAt.getTime() !== userSongsMap.get(id)!.getTime()) {
        toBeUpdated.push(id)
      }
    })

    // Check if songs are missing in the input
    userSongsMap.forEach((_, id) => {
      if (!inputSongsMap.has(id)) {
        toBeCreated.push(id)
      }
    })

    return new SongCheckAllOutputImpl({
      toBeUpdated,
      toBeCreated,
      toBeDeleted,
    })
  }

  /**
   * Searches for original lyrics on Genius.com
   * @returns original lyrics or null if not found
   */
  async searchOriginalLyrics({
    artist,
    title,
  }: {
    artist: string
    title: string
  }): Promise<{ originalLyrics: string } | null> {
    try {
      const searches = await this.geniusLyricsClient.songs.search(
        `${artist} ${title}`,
      )
      if (searches.length === 0) {
        return null
      }
      let lyrics = await searches[0].lyrics()
      /**
       * Matches for [...]
       */
      const squaredBracketsRegex = /\[(.*?)\]/g
      /**
       * Matches for two or more consecutive newlines
       */
      const repeatingNewLinesRegex = /\n{2,}/g
      lyrics = lyrics
        .replace(repeatingNewLinesRegex, "\n")
        .split("\n")
        .splice(1)
        .map((l) => l.replace(squaredBracketsRegex, "").trim())
        .join("\n")
      return { originalLyrics: lyrics }
    } catch (error) {
      this.logger.error("GeniusLyrics API request failed:", error)
      return null
    }
  }
}
