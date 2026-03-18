import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { ImageModule } from '../image/image.module';
import { ImageService } from '../image/image.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  providers: [EmailService, DatabaseService, UserService, ImageService, SupabaseService],
  imports: [DatabaseModule, UserModule, ImageModule, SupabaseModule],
  controllers: [EmailController]
})
export class EmailModule {}
