import { Module } from "@nestjs/common"
import { SupabaseModule } from "../supabase/supabase.module"
import { SupabaseService } from "../supabase/supabase.service"
import { CoversService } from "./covers.service"
import { DatabaseService } from "../database/database.service"
import { DatabaseModule } from "../database/database.module"
import { ImageModule } from "../image/image.module"
import { ImageService } from "../image/image.service"

@Module({
  imports: [SupabaseModule, DatabaseModule, ImageModule],
  providers: [CoversService, DatabaseService, SupabaseService, ImageService],
  exports: [CoversService],
})
export class CoversModule {}
