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
  @ApiOperation({
    summary: 'Initiate Google OAuth sign-in',
    description:
      'Redirects the browser to Google for OAuth authentication. ' +
      'No request body — handled entirely by Passport.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google consent screen',
  })
  handler(): void {
    // Passport redirects — no body needed
  }
}
