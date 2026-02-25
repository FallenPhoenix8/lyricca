import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { UserService } from "../user/user.service"
import { AuthPayload } from "@shared/ts-types"
import { hash, compare } from "bcrypt"
import { JwtService } from "@nestjs/jwt"
import { jwtConstants } from "./constants"
import type { VerifiedTokenPayload } from "./auth.guard"

@Injectable()
export class AuthService {
  private readonly saltOrRounds = 10
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<AuthPayload> {
    const invalidCredentialsException = new UnauthorizedException(
      "Invalid username or password.",
    )
    const user = await this.userService.findOne({ username })
    if (!user) {
      throw invalidCredentialsException
    }
    const isPasswordCorrect = await compare(password, user.password)
    if (!isPasswordCorrect) {
      throw invalidCredentialsException
    }

    return { token: this.generateToken(user.id, user.username) }
  }

  async signUp(username: string, password: string): Promise<AuthPayload> {
    const usernameExistsException = new ConflictException(
      "Username already exists.",
    )
    const existingUser = await this.userService.findOne({ username })
    if (existingUser) {
      throw usernameExistsException
    }
    const hashedPassword = await hash(password, this.saltOrRounds)
    const newUser = await this.userService.create({
      username,
      password: hashedPassword,
    })

    return { token: this.generateToken(newUser.id, newUser.username) }
  }

  async refresh(request: any): Promise<AuthPayload | "long-ttl"> {
    const token: string = request["token"]
    const payload = (await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    })) as VerifiedTokenPayload

    const remainingTime = payload.exp - Date.now() / 1000
    const isLongTTL = remainingTime > 60 * 60 * 24 * 7 // 7 days

    if (isLongTTL) {
      return "long-ttl"
    }
    return { token: this.generateToken(payload.sub, payload.username) }
  }

  generateToken(userId: string, username: string): string {
    return this.jwtService.sign({ sub: userId, username })
  }
}
