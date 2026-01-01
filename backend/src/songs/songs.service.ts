import { Injectable } from "@nestjs/common"
import { DatabaseService } from "../database/database.service"
import { SongCreateDTOImpl, SongImpl, SongUpdateDTOImpl } from "./dto/song-dto"
import { SongCreateDTO } from "@shared/ts-types"

@Injectable()
export class SongsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createSongDto: SongCreateDTO & { user_id: string },
  ): Promise<SongImpl> {
    const song = await this.databaseService.song.create({
      data: {
        title: createSongDto.title,
        artist: createSongDto.artist,
        album: createSongDto.album,
        original_lyrics: createSongDto.original_lyrics,
        translated_lyrics: createSongDto.translated_lyrics,
        user_id: createSongDto.user_id,
      },
      include: { user: true },
    })
    return new SongImpl(song)
  }

  async remove(id: string): Promise<SongImpl> {
    const song = await this.databaseService.song.delete({
      where: { id },
      include: { user: true },
    })
    return new SongImpl(song)
  }

  async update(
    id: string,
    updateSongDto: SongUpdateDTOImpl,
  ): Promise<SongImpl> {
    const song = await this.databaseService.song.update({
      where: { id },
      data: {
        title: updateSongDto.title,
        artist: updateSongDto.artist,
        album: updateSongDto.album,
        original_lyrics: updateSongDto.original_lyrics,
        translated_lyrics: updateSongDto.translated_lyrics,
      },
      include: { user: true },
    })
    return new SongImpl(song)
  }

  async findOne(props: { id: string }): Promise<SongImpl | null> {
    const song = await this.databaseService.song.findUnique({
      where: { id: props.id },
      include: { user: true },
    })
    if (!song) {
      return null
    }
    return new SongImpl(song)
  }
}
