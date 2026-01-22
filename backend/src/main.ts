import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import cookieParser from "cookie-parser"
import { ConsoleLogger, ValidationPipe } from "@nestjs/common"

async function bootstrap() {
  const frontendURL = process.env.FRONTEND_URL
  if (!frontendURL) {
    throw new Error("FRONTEND_URL environment variable is not set.")
  }

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      timestamp: true,
    }),
    cors: {
      origin: [frontendURL],
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      preflightContinue: false,
      credentials: true,
      optionsSuccessStatus: 204,
    },
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.enableShutdownHooks()
  const cookieSecret = process.env.COOKIE_SECRET
  if (!cookieSecret) {
    throw new Error("COOKIE_SECRET environment variable is not set.")
  }
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not set.")
  }

  app.use(cookieParser(cookieSecret))
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
