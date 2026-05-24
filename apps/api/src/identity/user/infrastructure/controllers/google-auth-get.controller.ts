import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from '@/shared/infrastructure/auth/google.guard';

@ApiTags('auth')
@Controller('auth')
export class GoogleAuthGetController {
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  handler(): void {
    // Passport redirects — no body needed
  }
}
