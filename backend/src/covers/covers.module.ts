import { Module } from "@nestjs/common"
import { SupabaseModule } from "../supabase/supabase.module"
import { SupabaseService } from "../supabase/supabase.service"
import { CoversService } from "./covers.service"
import { DatabaseService } from "../database/database.service"
import { DatabaseModule } from "../database/database.module"
import { ImageModule } from "../image/image.module"
import { ImageService } from "../image/image.service"
import { CoversController } from "./covers.controller"
import { UserModule } from "../user/user.module"
import { UserService } from "../user/user.service"

@Module({
  imports: [SupabaseModule, DatabaseModule, ImageModule, UserModule],
  providers: [
    CoversService,
    DatabaseService,
    SupabaseService,
    ImageService,
    UserService,
  ],
  exports: [CoversService],
  controllers: [CoversController],
})
export class CoversModule {}
