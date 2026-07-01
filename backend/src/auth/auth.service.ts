import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { UserService } from "../user/user.service"
import { AuthPayload } from "@shared/ts-types"
import { hash, compare } from "bcrypt"
import { JwtService } from "@nestjs/jwt"
import { jwtConstants, saltOrRounds } from "./constants"
import type { VerifiedTokenPayload } from "./auth.guard"
import { UserDTOImpl, UserImpl } from "../user/dto/user-dto"
import { EmailService } from "../email/email.service"
import * as crypto from "crypto"

@Injectable()
export class AuthService {
  private readonly saltOrRounds = saltOrRounds
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await hash(password, this.saltOrRounds)
  }

  async signIn({
    name,
    password,
  }: {
    name: string
    password: string
  }): Promise<AuthPayload> {
    const invalidCredentialsException = new UnauthorizedException([
      "Invalid username or password.",
    ])
    let user: UserImpl | null = null
    user = await this.userService.findOne({ username: name })
    if (!user && name.includes("@")) {
      user = await this.userService.findOne({ email: name })
    }
    if (!user) {
      throw invalidCredentialsException
    }
    const isPasswordCorrect = await compare(password, user.password)
    if (!isPasswordCorrect) {
      throw invalidCredentialsException
    }

    return { token: this.generateToken(user.id, user.username) }
  }

  async signUp({
    username,
    email,
    password,
  }: {
    username: string
    password: string
    email: string
  }): Promise<AuthPayload> {
    const usernameExistsException = new ConflictException([
      "Username already exists.",
    ])
    const existingUser = await this.userService.findOne({ username })
    if (existingUser) {
      throw usernameExistsException
    }
    const hashedPassword = await this.hashPassword(password)
    const newUser = await this.userService.create({
      username,
      email,
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

  private hashResetToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }

  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim()

    const user = await this.userService.findOne({ email: normalizedEmail })

    // Do not reveal whether this email exists
    if (!user) {
      return
    }

    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = this.hashResetToken(rawToken)

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    await this.userService.setPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    })

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`

    await this.emailService.sendPasswordResetEmail(user.email, resetUrl)
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string
    password: string
  }): Promise<void> {
    if (!token || !password) {
      throw new BadRequestException(["Invalid reset request."])
    }

    if (password.length < 8) {
      throw new BadRequestException(["Password must be at least 8 characters."])
    }

    const tokenHash = this.hashResetToken(token)

    const user = await this.userService.findByResetPasswordTokenHash(tokenHash)

    if (!user) {
      throw new BadRequestException(["Invalid or expired reset link."])
    }

    if (
      !user.reset_password_expires_at ||
      user.reset_password_expires_at < new Date()
    ) {
      throw new BadRequestException(["Invalid or expired reset link."])
    }

    const hashedPassword = await this.hashPassword(password)

    await this.userService.updatePasswordAndClearResetToken({
      userId: user.id,
      hashedPassword,
    })
  }
}
