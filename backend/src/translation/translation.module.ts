import { Module } from "@nestjs/common"
import { TranslationService } from "./translation.service"
import { TranslationController } from "./translation.controller"
import { CacheModule } from "@nestjs/cache-manager"
import { UserModule } from "../user/user.module"
import { UserService } from "../user/user.service"
import { ImageService } from "../image/image.service"
import { SupabaseService } from "../supabase/supabase.service"
import { ImageModule } from "../image/image.module"
import { SupabaseModule } from "../supabase/supabase.module"

@Module({
  providers: [
    TranslationService,
    CacheModule,
    UserService,
    ImageService,
    SupabaseService,
  ],
  controllers: [TranslationController],
  imports: [CacheModule.register(), UserModule, ImageModule, SupabaseModule],
})
export class TranslationModule {}
