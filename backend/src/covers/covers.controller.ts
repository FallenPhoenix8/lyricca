import {
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
    @Query("artist") artist: string,
    @Query("title") title: string,
  ): Promise<SuggestionDTO> {
    const userAgent = req.headers["user-agent"] ?? "LyriccaApp/1.0"
    const coverURL = await this.coversService.getSuggestionURL({
      artist,
      title,
      userAgent,
    })

    return {
      url: coverURL?.toString() ?? null,
    }
  }
}
