import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common"
import { LoginDTOImpl } from "./dto/auth-dto"
import { AuthService } from "./auth.service"
import type { Response } from "express"
import { AuthGuard } from "./auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("sign-in")
  async signIn(
    @Body() body: LoginDTOImpl,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authPayload = await this.authService.signIn(
      body.username,
      body.password,
    )
    response.cookie("token", authPayload.token)
    return authPayload
  }

  @Post("sign-up")
  async signUp(
    @Body() body: LoginDTOImpl,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authPayload = await this.authService.signUp(
      body.username,
      body.password,
    )
    response.cookie("token", authPayload.token)
    return authPayload
  }

  @UseGuards(AuthGuard)
  @Post("sign-out")
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("token")
  }
}
