import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}
    
    @Get("verify")
    async verifyEmail(@Query("email") email: string) {
        return await this.emailService.verifyEmail(email)
    }
}
