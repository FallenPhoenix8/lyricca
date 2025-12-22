import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"
import { TranslationService } from "./translation.service"
import { LanguageDTO, TranslationOutputDTO } from "@shared/ts-types"
import { TranslationInputDTOImpl } from "./dto/translation-dto"
import { AuthGuard } from "../auth/auth.guard"

@Controller("translate")
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @UseGuards(AuthGuard)
  @Get("languages")
  async availableLanguages(): Promise<LanguageDTO[]> {
    return await this.translationService.availableLanguages()
  }

  @UseGuards(AuthGuard)
  @Post()
  async translate(
    @Body() body: TranslationInputDTOImpl,
  ): Promise<TranslationOutputDTO> {
    return await this.translationService.translate(body)
  }
}
