import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
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

@Controller("songs")
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly coversService: CoversService,
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
  @UseInterceptors(
    FileInterceptor("cover", {
      fileFilter: (req, file, cb) => {
        /**
         * Allowed cover mime types. Most common image formats.
         * @note Used in cover file upload validation
         */
        const allowedMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ]
        const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype)
        if (!isAllowedMimeType) {
          const allowedFileExtensions: string[] = allowedMimeTypes.map((mt) => {
            return mt.split("/")[1]
          })
          cb(
            new BadRequestException(
              `Invalid file type. Allowed file types: ${allowedFileExtensions.join(", ")}`,
            ),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async create(
    @Req() req: any,
    @Body() body: SongCreateDTOImpl,
    @UploadedFile() coverFile: Express.Multer.File,
  ): Promise<SongDTOImpl> {
    //* MARK: - Get user from request
    const user = await req.user()

    // * MARK: - Convert `Express.Multer.File` to `File` object
    const bytes = Uint8Array.from(coverFile.buffer)
    const blob = new Blob([bytes], { type: coverFile.mimetype })

    const cover = await this.coversService.create(
      new File([blob], coverFile.originalname, { type: coverFile.mimetype }),
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
