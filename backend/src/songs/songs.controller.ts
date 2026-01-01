import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common"
import { AuthGuard } from "../auth/auth.guard"
import {
  SongCreateDTOImpl,
  SongDTOImpl,
  SongImpl,
  SongUpdateDTOImpl,
} from "./dto/song-dto"
import { SongsService } from "./songs.service"

@Controller("songs")
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req: any): Promise<SongDTOImpl[]> {
    const user = await req.user()
    return user.songs.map((song: SongImpl) => new SongDTOImpl(song))
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: any,
    @Body() body: SongCreateDTOImpl,
  ): Promise<SongDTOImpl> {
    const user = await req.user()
    const song = await this.songsService.create({
      ...body,
      user_id: user.id,
    })
    return new SongDTOImpl(song)
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Req() req: any,
    @Body() body: SongUpdateDTOImpl,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<SongDTOImpl> {
    const user = await req.user()
    const existingSong = await this.songsService.findOne({ id: id })
    if (!existingSong) {
      throw new NotFoundException("Song not found.")
    }

    if (existingSong.user_id !== user.id) {
      throw new ForbiddenException("You can only update your own songs.")
    }

    const song = await this.songsService.update(id, {
      ...body,
    })
    return new SongDTOImpl(song)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  async remove(
    @Req() req: any,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<SongDTOImpl> {
    const user = await req.user()
    const existingSong = await this.songsService.findOne({ id: id })
    if (!existingSong) {
      throw new NotFoundException("Song not found.")
    }

    if (existingSong.user_id !== user.id) {
      throw new ForbiddenException("You can only delete your own songs.")
    }

    const song = await this.songsService.remove(id)
    return new SongDTOImpl(song)
  }
}
