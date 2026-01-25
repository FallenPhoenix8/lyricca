import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UserModule } from "./user/user.module"
import { DatabaseService } from "./database/database.service"
import { DatabaseModule } from "./database/database.module"
import { AuthModule } from "./auth/auth.module"
import { TranslationModule } from "./translation/translation.module"
import { CacheModule } from "@nestjs/cache-manager"
import { SongsModule } from "./songs/songs.module"
import { UserService } from "./user/user.service"
import { CoversService } from './covers/covers.service';
import { CoversModule } from './covers/covers.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    AuthModule,
    TranslationModule,
    CacheModule.register(),
    SongsModule,
    CoversModule,
    SupabaseModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, UserService, CoversService],
})
export class AppModule {}
