import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UserModule } from "../user/user.module"
import { JwtModule } from "@nestjs/jwt"
import { jwtConstants } from "./constants"
import { UserService } from "../user/user.service"
import { ImageService } from "../image/image.service"
import { SupabaseService } from "../supabase/supabase.service"
import { ImageModule } from "../image/image.module"
import { SupabaseModule } from "../supabase/supabase.module"
import { EmailModule } from "../email/email.module"
import { EmailService } from "../email/email.service"

@Module({
  providers: [AuthService, UserService, ImageService, SupabaseService, EmailService],
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "30d" },
    }),
    ImageModule,
    SupabaseModule,
    EmailModule
  ],
  controllers: [AuthController],
})
export class AuthModule {}
