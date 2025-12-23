import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common"
import { LoginDTOImpl } from "./dto/auth-dto"
import { AuthService } from "./auth.service"
import type { Response } from "express"
import { AuthGuard } from "./auth.guard"
import { UserDTOImpl } from "../user/dto/user-dto"
import { AuthPayload } from "@shared/ts-types"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-in")
  async signIn(
    @Body() body: LoginDTOImpl,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthPayload> {
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
  ): Promise<AuthPayload> {
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

  @UseGuards(AuthGuard)
  @Get("me")
  async me(@Req() req: any): Promise<UserDTOImpl> {
    return new UserDTOImpl(req.user)
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() req: any,
  ): Promise<AuthPayload> {
    const token = this.authService.generateToken(req.user.id, req.user.username)
    response.cookie("token", token)
    return { token }
  }
}
