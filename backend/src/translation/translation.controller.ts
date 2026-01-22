import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common"
import { TranslationService } from "./translation.service"
import { AvailableLanguages, TranslationOutputDTO } from "@shared/ts-types"
import { TranslationInputDTOImpl } from "./dto/translation-dto"
import { AuthGuard } from "../auth/auth.guard"
import { SourceLanguageCode, TargetLanguageCode } from "deepl-node"

@Controller("translate")
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @UseGuards(AuthGuard)
  @Get("languages")
  async availableLanguages(): Promise<AvailableLanguages> {
    return await this.translationService.availableLanguages()
  }

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  async translate(
    @Body() body: TranslationInputDTOImpl,
  ): Promise<TranslationOutputDTO> {
    return await this.translationService.translate({
      text: body.text,
      from: body.from as SourceLanguageCode | undefined,
      to: body.to as TargetLanguageCode,
    })
  }
}
