import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import cookieParser from "cookie-parser"
import { ValidationPipe } from "@nestjs/common"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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
