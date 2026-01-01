import { Module } from "@nestjs/common"
import { TranslationService } from "./translation.service"
import { TranslationController } from "./translation.controller"
import { CacheModule } from "@nestjs/cache-manager"
import { UserModule } from "../user/user.module"
import { UserService } from "../user/user.service"

@Module({
  providers: [TranslationService, CacheModule, UserService],
  controllers: [TranslationController],
  imports: [CacheModule.register(), UserModule],
})
export class TranslationModule {}
