import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UserModule } from "../user/user.module"
import { JwtModule } from "@nestjs/jwt"
import { jwtConstants } from "./constants"
import { UserService } from "../user/user.service"

@Module({
  providers: [AuthService, UserService],
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60m" },
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
