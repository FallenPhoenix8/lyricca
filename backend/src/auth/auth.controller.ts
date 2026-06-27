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
import {
  ForgotPasswordDTOImpl,
  LoginDTOImpl,
  ResetPasswordDTOImpl,
} from "./dto/auth-dto"
import { AuthService } from "./auth.service"
import type { Response } from "express"
import { type AuthenticatedRequest, AuthGuard } from "./auth.guard"
import { UserDTOImpl } from "../user/dto/user-dto"
import { AuthPayload } from "@shared/ts-types"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-in")
  async signIn(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthPayload> {
    const { username, password } = body
    const authPayload = await this.authService.signIn({
      name: username,
      password,
    })
    response.cookie("token", authPayload.token)
    return authPayload
  }

  @Post("sign-up")
  async signUp(
    @Body() body: LoginDTOImpl,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthPayload> {
    const { username, password, email } = body
    const authPayload = await this.authService.signUp({
      username,
      password,
      email,
    })
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
  async me(@Req() req: AuthenticatedRequest): Promise<UserDTOImpl> {
    return new UserDTOImpl(await req.user())
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<AuthPayload | void> {
    const refreshResult = await this.authService.refresh(req)
    if (refreshResult === "long-ttl") {
      response.status(HttpStatus.NO_CONTENT)
    } else {
      response.cookie("token", refreshResult.token)
      return { token: refreshResult.token }
    }
  }

  @UseGuards(AuthGuard)
  @Get("check")
  @HttpCode(HttpStatus.NO_CONTENT)
  async check() {
    // If the request reaches this point, it means the user is authenticated, returning 204 No Content is sufficient
    // Otherwise, if the user is not authenticated, the AuthGuard will throw an UnauthorizedException and return a 401 response before reaching this point
  }

  @Post("forgot-password")
  async forgotPassword(@Body() body: ForgotPasswordDTOImpl) {
    await this.authService.forgotPassword(body.email)

    return {
      message:
        "If an account with this email exists, a reset link has been sent.",
    }
  }

  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordDTOImpl) {
    await this.authService.resetPassword({
      token: body.token,
      password: body.password,
    })

    return {
      message: "Password has been reset successfully.",
    }
  }
}
