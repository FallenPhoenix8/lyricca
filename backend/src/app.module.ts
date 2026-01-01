import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UserModule } from "./user/user.module"
import { DatabaseService } from "./database/database.service"
import { DatabaseModule } from "./database/database.module"
import { AuthModule } from "./auth/auth.module"
import { TranslationModule } from "./translation/translation.module"
import { CacheModule } from "@nestjs/cache-manager"
import { UserService } from "./user/user.service"
@Module({
  imports: [
    UserModule,
    DatabaseModule,
    AuthModule,
    TranslationModule,
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
