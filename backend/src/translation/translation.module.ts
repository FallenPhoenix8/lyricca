import { Module } from "@nestjs/common"
import { TranslationService } from "./translation.service"
import { TranslationController } from "./translation.controller"
import { CacheModule } from "@nestjs/cache-manager"

@Module({
  providers: [TranslationService, CacheModule],
  controllers: [TranslationController],
  imports: [CacheModule.register()],
})
export class TranslationModule {}
