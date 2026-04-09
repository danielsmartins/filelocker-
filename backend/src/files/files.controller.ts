import {
  Controller, Get, Post, Delete, Param,
  UploadedFile, UseInterceptors, UseGuards,
  HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  upload(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.filesService.uploadFile(file, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.filesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.filesService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req) {
    return this.filesService.remove(id, req.user.id);
  }
}