import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { jwtConstants } from "./constants"
import { Request } from "express"
import { UserService } from "../user/user.service"
import { UserImpl } from "../user/dto/user-dto"

export type VerifiedTokenPayload = {
  /**
   * Subject (user ID)
   */
  sub: string
  username: string
  /**
   * Issued at (seconds since Epoch)
   */
  iat: number
  /**
   * Expiration time (seconds since Epoch)
   */
  exp: number
}

export type AuthenticatedRequest = Request & {
  user: () => Promise<UserImpl>
  token: string
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token =
      this.extractTokenFromHeader(request) ?? request.cookies["token"]
    if (!token) {
      throw new UnauthorizedException()
    }
    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      })) as VerifiedTokenPayload

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers

      request["user"] = async () => {
        return await this.retrieveUser(payload.sub)
      }
      request["token"] = token
    } catch {
      throw new UnauthorizedException()
    }
    return true
  }
  private async retrieveUser(id: string) {
    const user = await this.userService.findOne({ id })
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
