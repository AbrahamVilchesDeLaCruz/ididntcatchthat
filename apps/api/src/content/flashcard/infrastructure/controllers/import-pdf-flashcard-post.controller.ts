import {
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { PdfFlashcardImporter } from '@/content/flashcard/application/import-pdf/pdf-flashcard-importer';
import { type FlashcardDraft } from '@/content/flashcard/domain/pdf-flashcard-extractor';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportPdfFlashcardPostController {
  constructor(private readonly importer: PdfFlashcardImporter) {}

  @Post('import/pdf')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Extract flashcard drafts from a PDF file' })
  @ApiResponse({ status: 200, description: 'Extracted flashcard drafts' })
  @ApiResponse({ status: 422, description: 'PDF extraction failed' })
  async handler(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: {
      buffer: Buffer;
    },
  ): Promise<FlashcardDraft[]> {
    return this.importer.execute(file.buffer);
  }
}
