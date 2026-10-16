import { Module } from "@nestjs/common"
import { SongsService } from "./songs.service"
import { SongsController } from "./songs.controller"
import { AuthService } from "../auth/auth.service"
import { AuthModule } from "../auth/auth.module"
import { UserModule } from "../user/user.module"
import { UserService } from "../user/user.service"
import { CoversModule } from "../covers/covers.module"
import { CoversService } from "../covers/covers.service"
import { SupabaseService } from "../supabase/supabase.service"
import { ImageService } from "../image/image.service"
import { ImageModule } from "../image/image.module"
import { EmailService } from "../email/email.service"
import { EmailModule } from "../email/email.module"
import { SongsGateway } from "./songs.gateway"

@Module({
  providers: [
    SongsService,
    AuthService,
    UserService,
    CoversService,
    SupabaseService,
    ImageService,
    EmailService,
    SongsGateway,
  ],
  controllers: [SongsController],
  imports: [AuthModule, UserModule, CoversModule, ImageModule, EmailModule],
})
export class SongsModule {}
