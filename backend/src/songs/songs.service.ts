import { Injectable } from "@nestjs/common"
import { DatabaseService } from "../database/database.service"
import {
  SongCheckAllInputImpl,
  SongCheckAllOutputImpl,
  SongCreateDTOImpl,
  SongImpl,
  SongUpdateDTOImpl,
} from "./dto/song-dto"
import { SongCreateDTO } from "@shared/ts-types"
import { CoverDTOImpl } from "../covers/dto/cover-dto"

@Injectable()
export class SongsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createSongDto: SongCreateDTO & { user_id: string; cover_id: string },
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
    const song = await this.databaseService.song.update({
      where: { id },
      data: {
        title: updateSongDto.title,
        artist: updateSongDto.artist,
        album: updateSongDto.album,
        original_lyrics: updateSongDto.original_lyrics,
        translated_lyrics: updateSongDto.translated_lyrics,
        cover_id: updateSongDto.cover_id,
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
}
