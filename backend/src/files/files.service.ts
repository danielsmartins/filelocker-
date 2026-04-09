import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FileResponseDto } from './dto/file-response.dto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  private fixEncoding(filename: string): string {
  // If converting latin1→utf8 produces valid UTF-8 with non-ASCII chars,
  // it means Multer mangled the encoding and we should use the converted version.
  // Otherwise keep the original (already valid UTF-8).
  try {
    const converted = Buffer.from(filename, 'latin1').toString('utf8');
    // Check if original has mojibake patterns (latin1 artifacts like Ã, â, Â)
    const hasMojibake = /[\xC0-\xFF][\x80-\xBF]/.test(filename) ||
      /Ã|â|Â|Ã©|Ã§|Ã£/.test(filename);
    return hasMojibake ? converted : filename;
  } catch {
    return filename;
  }
}

  async uploadFile(file: Express.Multer.File, userId: string): Promise<FileResponseDto> {
    if (!ALLOWED_TYPES.includes(file.mimetype))
      throw new BadRequestException('Tipo não permitido. Use JPG, PNG ou PDF.');
    if (file.size > MAX_SIZE_BYTES)
      throw new BadRequestException('Arquivo muito grande. Máximo: 10MB.');

    // (Latin-1 to UTF-8)
    const originalNameUtf8 = this.fixEncoding(file.originalname);
    const url = await this.storage.upload(file.buffer, originalNameUtf8, file.mimetype);

    return this.prisma.file.create({
      data: { name: originalNameUtf8, url, type: file.mimetype, size: file.size, userId },
    });
  }

  async findAll(userId: string): Promise<FileResponseDto[]> {
    return this.prisma.file.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, userId: string): Promise<FileResponseDto> {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Arquivo não encontrado');
    if (file.userId !== userId) throw new ForbiddenException();
    return file;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const file = await this.findOne(id, userId);
    await this.storage.delete(file.url);
    await this.prisma.file.delete({ where: { id } });
    return { message: 'Arquivo excluído com sucesso' };
  }
}