import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common"
import { CoversService } from "./covers.service"
import { AuthGuard, type AuthenticatedRequest } from "../auth/auth.guard"
import { SuggestionDTO } from "@shared/ts-types/cover-dto"

@Controller("covers")
export class CoversController {
  constructor(private readonly coversService: CoversService) {}

  @UseGuards(AuthGuard)
  @Get("suggestion")
  async getSuggestion(
    @Req() req: AuthenticatedRequest,
    @Query("artist") artist: string | undefined,
    @Query("title") title: string | undefined,
    @Query("album") album: string | undefined,
  ): Promise<SuggestionDTO> {
    const errors: string[] = []
    const decodedArtist = decodeURIComponent(artist ?? "") ?? ""
    const decodedTitle = decodeURIComponent(title ?? "") ?? ""
    const decodedAlbum = decodeURIComponent(album ?? "") ?? ""

    if (!decodedTitle.trim()) {
      errors.push(
        "`title` query parameter is required. It must be a non-empty string.",
      )
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors)
    }

    const userAgent = req.headers["user-agent"] ?? "LyriccaApp/1.0.0"
    const coverURL = await this.coversService.getSuggestionURL({
      userAgent,
      title: decodedTitle,
      artist: decodedArtist || null,
      album: decodedAlbum || null,
    })

    return {
      url: coverURL?.toString() ?? null,
    }
  }
}
