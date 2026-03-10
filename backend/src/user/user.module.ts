import { Module } from "@nestjs/common"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { ImageService } from "../image/image.service"
import { ImageModule } from "../image/image.module"
import { SupabaseService } from "../supabase/supabase.service"
import { SupabaseModule } from "../supabase/supabase.module"
import { AuthModule } from "../auth/auth.module"
import { AuthService } from "../auth/auth.service"

@Module({
  imports: [ImageModule, SupabaseModule],
  controllers: [UserController],
  providers: [UserService, ImageService, SupabaseService],
})
export class UserModule {}
