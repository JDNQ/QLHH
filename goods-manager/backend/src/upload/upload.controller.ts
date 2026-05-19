import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { mkdirSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

const imageFilter = (req: any, file: any, cb: Function) => {
  const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(
      new BadRequestException(
        "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)",
      ),
      false,
    );
  }
  cb(null, true);
};

function ensureUploadDir(folder: "images" | "avatars") {
  const dir = join(process.cwd(), "uploads", folder);
  mkdirSync(dir, { recursive: true });
  return dir;
}

const imageStorage = diskStorage({
  destination: ensureUploadDir("images"),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  },
});

const avatarStorage = diskStorage({
  destination: ensureUploadDir("avatars"),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  },
});

@Controller("upload")
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post("image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: imageStorage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = this.uploadService.processImage(file);
    return { url };
  }

  @Post("images")
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: imageStorage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = this.uploadService.processImages(files);
    return { urls };
  }

  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: avatarStorage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    const url = this.uploadService.processAvatar(file);
    return { url };
  }
}
