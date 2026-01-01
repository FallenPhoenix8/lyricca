import { Module } from "@nestjs/common"
import { SongsService } from "./songs.service"
import { SongsController } from "./songs.controller"
import { AuthService } from "../auth/auth.service"
import { AuthModule } from "../auth/auth.module"
import { UserModule } from "../user/user.module"
import { UserService } from "../user/user.service"

@Module({
  providers: [SongsService, AuthService, UserService],
  controllers: [SongsController],
  imports: [AuthModule, UserModule],
})
export class SongsModule {}
