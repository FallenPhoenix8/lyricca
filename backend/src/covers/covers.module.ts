import { Module } from "@nestjs/common"
import { SupabaseModule } from "../supabase/supabase.module"
import { SupabaseService } from "../supabase/supabase.service"
import { CoversService } from "./covers.service"
import { DatabaseService } from "../database/database.service"
import { DatabaseModule } from "../database/database.module"

@Module({
  imports: [SupabaseModule, DatabaseModule],
  providers: [CoversService, DatabaseService, SupabaseService],
  exports: [CoversService],
})
export class CoversModule {}
