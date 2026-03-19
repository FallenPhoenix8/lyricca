import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common"
import nodemailer from "nodemailer"

import type { EmailVerificationDTO } from "@shared/ts-types"
import { UserService } from "../user/user.service"
import SMTPTransport from "nodemailer/lib/smtp-transport"

const smtpHost = process.env.SMTP_HOST
if (!smtpHost) {
  throw new Error("SMTP_HOST environment variable is not set")
}
const smtpPort = process.env.SMTP_PORT
if (!smtpPort) {
  throw new Error("SMTP_PORT environment variable is not set")
}
const smtpUser = process.env.SMTP_USER
if (!smtpUser) {
  throw new Error("SMTP_USER environment variable is not set")
}
const smtpPass = process.env.SMTP_PASS
if (!smtpPass) {
  throw new Error("SMTP_PASSWORD environment variable is not set")
}
const fromEmailAddress = process.env.FROM_EMAIL_ADDRESS

if (!fromEmailAddress) {
  throw new Error("FROM_EMAIL_ADDRESS environment variable is not set")
}

@Injectable()
export class EmailService {
  constructor(private readonly userService: UserService) {}
  readonly transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  } as SMTPTransport.Options)

  fillOTPEmailTemplate(title: string, otp: string) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    /* Shadcn Neutral Palette */
    :root {
      --background: #ffffff;
      --foreground: #0a0a0a;
      --muted: #f5f5f5;
      --muted-foreground: #737373;
      --border: #e5e5e5;
    }

    @media(prefers-color-scheme: dark) {
      :root {
        --background: #0a0a0a;
        --foreground: #ffffff;
        --muted: #4a4a4a;
        --muted-foreground: #737373;
        --border: #e5e5e5;
      }
    }

    body {
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      width: 100%;
      table-layout: fixed;
      padding: 40px 0;
    }

    .container {
      max-width: 440px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 40px;
    }

    .logo {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: -0.02em;
      color: #0a0a0a;
      margin-bottom: 24px;
      text-align: left;
    }


    .title {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #0a0a0a;
      margin-bottom: 8px;
    }

    .description {
      font-size: 14px;
      line-height: 20px;
      color: #737373;
      margin-bottom: 32px;
    }

    .otp-container {
      background-color: #f5f5f5;
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      margin-bottom: 32px;
    }

    .otp-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: #0a0a0a;
    }

    .footer {
      font-size: 12px;
      line-height: 18px;
      color: #a3a3a3;
      border-top: 1px solid #e5e5e5;
      padding-top: 24px;
      margin-top: 8px;
    }

    .link {
      color: #0a0a0a;
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    img {
      display: block;
    }

    @media(prefers-color-scheme: dark) {
      img {
          -webkit-filter: invert(100%); /* Safari/Chrome */
          filter: invert(100%);
      }  
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <img src="https://github.com/FallenPhoenix8/lyricca/blob/main/backend/assets/lyricca-logo-full.png?raw=true" alt="Lyricca Logo" width="154" height="55" />
      </div>

      <h1 class="title">${title}</h1>
      <p class="description">
        Enter the following code in your browser to confirm your identity.
      </p>

      <div class="otp-container">
        <div class="otp-code">${otp}</div>
      </div>

      <p class="description">
        If you didn't request this code, you can safely ignore this email.
      </p>

      <div class="footer">
        Sent by <strong>Lyricca</strong><br />
      </div>
    </div>
  </div>
</body>
</html>
        `
  }

  async sendEmail(email: string, subject: string, body: string) {
    const emailData = {
      from: `Lyricca <${fromEmailAddress}>`,
      to: email,
      subject,
      html: body,
    }
    const emailCreateResponse = await this.transporter.sendMail(emailData)
    if (emailCreateResponse.rejected.length > 0) {
      throw new BadGatewayException("Email was rejected by the SMTP server.")
    }
  }

  async verifyEmail(email: string) {
    // * MARK: - Check if email address is valid
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!emailRegex.test(email)) {
      throw new BadRequestException("Invalid email address.")
    }

    // * MARK: - Check if email address is already in use
    const user = await this.userService.findOne({ email })
    if (user) {
      throw new ConflictException("Email address is already in use.")
    }

    // * MARK: - Generate random 6-digit OTP
    let otp: string = ""
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10).toString()
    }
    // * MARK: - Send verification email
    await this.sendEmail(
      email,
      "Verify your email address",
      this.fillOTPEmailTemplate("Verify your email address", otp),
    )
    return {
      email,
      otp,
    }
  }
}
