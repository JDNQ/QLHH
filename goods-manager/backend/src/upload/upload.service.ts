import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadService {
  processImage(file: Express.Multer.File): string {
    if (!file) throw new BadRequestException('Không có file được upload');
    return `/uploads/images/${file.filename}`;
  }

  processImages(files: Express.Multer.File[]): string[] {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file được upload');
    }
    return files.map((f) => `/uploads/images/${f.filename}`);
  }

  processAvatar(file: Express.Multer.File): string {
    if (!file) throw new BadRequestException('Không có file được upload');
    return `/uploads/avatars/${file.filename}`;
  }
}
