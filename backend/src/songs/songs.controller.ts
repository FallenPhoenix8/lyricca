import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  NotImplementedException,
  Param,
  ParseDatePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { AuthGuard } from "../auth/auth.guard"
import {
  SongCreateDTOImpl,
  SongDTOImpl,
  SongImpl,
  SongUpdateDTOImpl,
} from "./dto/song-dto"
import type { SongCheckOutput } from "@shared/ts-types/song-dto"
import { SongsService } from "./songs.service"
import { FileInterceptor } from "@nestjs/platform-express"
import { UploadedFile } from "@nestjs/common"
import { CoversService } from "../covers/covers.service"
import { ImageService } from "../image/image.service"

@Controller("songs")
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly coversService: CoversService,
    private readonly imageService: ImageService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req: any): Promise<SongDTOImpl[]> {
    const user = await req.user()
    return user.songs.map((song: SongImpl) => new SongDTOImpl(song))
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<SongDTOImpl> {
    const song = await this.songsService.findOne({ id })
    if (!song) {
      throw new NotFoundException("Song not found.")
    }
    return new SongDTOImpl(song)
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("cover"))
  async create(
    @Req() req: any,
    @Body() body: SongCreateDTOImpl,
    @UploadedFile() coverFile: Express.Multer.File,
  ): Promise<SongDTOImpl> {
    //* MARK: - Get user from request
    const user = await req.user()

    // * MARK: - Convert `Express.Multer.File` to `File` object
    const optimizedFile =
      await this.imageService.validateAndOptimizeImage(coverFile)
    const bytes = Uint8Array.from(optimizedFile.buffer)
    const blob = new Blob([bytes], { type: optimizedFile.mimeType })

    const cover = await this.coversService.create(
      new File([blob], coverFile.originalname, {
        type: optimizedFile.mimeType,
      }),
    )

    // * MARK: - Create song
    const song = await this.songsService.create({
      ...body,
      user_id: user.id,
      cover_id: cover.id,
    })

    return new SongDTOImpl(song)
  }

  // TODO: Implement UPDATE for cover
  @UseGuards(AuthGuard)
  @Patch(":id")
  @UseInterceptors(FileInterceptor("cover"))
  async update(
    @Req() req: any,
    @Body() body: SongUpdateDTOImpl,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() coverFile?: Express.Multer.File,
  ): Promise<SongDTOImpl> {
    const user = await req.user()
    const existingSong = await this.songsService.findOne({ id: id })
    if (!existingSong) {
      throw new NotFoundException("Song not found.")
    }

    if (existingSong.user_id !== user.id) {
      throw new ForbiddenException("You can only update your own songs.")
    }

    if (coverFile) {
      // * MARK: - Convert `Express.Multer.File` to `File` object
      const optimizedFile =
        await this.imageService.validateAndOptimizeImage(coverFile)
      const bytes = Uint8Array.from(optimizedFile.buffer)
      const blob = new Blob([bytes], { type: optimizedFile.mimeType })

      //* MARK: - Update song cover
      //*   1) Create new cover
      //*   2) Remove previous cover
      //*   3) Update song with new cover ID

      const cover = await this.coversService.create(
        new File([blob], coverFile.originalname, {
          type: optimizedFile.mimeType,
        }),
      )

      await this.songsService.update(id, {
        cover_id: cover.id,
      })

      const previousCover = existingSong.cover
      if (previousCover) {
        await this.coversService.remove(previousCover.id)
      }
    }

    //* MARK: - Update song with remaining details
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

  @UseGuards(AuthGuard)
  @Get(":id/check")
  async check(
    @Query("updated_at", new ParseDatePipe()) updatedAt: Date,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<SongCheckOutput> {
    const song = await this.songsService.findOne({ id })
    if (!song) {
      throw new NotFoundException("Song not found.")
    }

    if (song.updated_at.getTime() === updatedAt.getTime()) {
      return {
        isUpToDate: true,
        data: null,
      }
    } else {
      return {
        isUpToDate: false,
        data: new SongDTOImpl(song),
      }
    }
  }
}
