"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export interface UploadedImage {
  id: string;
  url: string;
  isMain: boolean;
  uploading?: boolean;
  error?: boolean;
  localPreview?: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (
    next: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[]),
  ) => void;
  onDeleteServer?: (url: string) => Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  images,
  onChange,
  onDeleteServer,
  maxFiles = 10,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remaining = maxFiles - images.length;
      if (remaining <= 0) {
        toast.error(`Tối đa ${maxFiles} ảnh`);
        return;
      }
      const files = acceptedFiles.slice(0, remaining);

      // Add placeholders immediately
      const placeholders: UploadedImage[] = files.map((file, i) => ({
        id: `local-${Date.now()}-${i}`,
        url: "",
        isMain: images.length === 0 && i === 0,
        uploading: true,
        localPreview: URL.createObjectURL(file),
      }));
      onChange([...images, ...placeholders]);

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const placeholder = placeholders[i];
        try {
          const url = await uploadService.uploadImage(file);
          onChange((prev: UploadedImage[]) =>
            prev.map((img) =>
              img.id === placeholder.id
                ? { ...img, url, uploading: false, localPreview: undefined }
                : img,
            ),
          );
        } catch {
          onChange((prev: UploadedImage[]) =>
            prev.map((img) =>
              img.id === placeholder.id
                ? { ...img, uploading: false, error: true }
                : img,
            ),
          );
          toast.error(`Upload ${file.name} thất bại`);
        }
      }
    },
    [images, maxFiles, onChange],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: images.length >= maxFiles,
    onDragEnter: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    onDropAccepted: () => setDragging(false),
    onDropRejected: (files) => {
      setDragging(false);
      files.forEach(({ errors }) => {
        if (errors[0]?.code === "file-too-large")
          toast.error(`Ảnh quá ${maxSizeMB}MB`);
        else toast.error("Định dạng không hỗ trợ (chỉ JPG, PNG, WebP)");
      });
    },
  });

  const removeImage = async (img: UploadedImage) => {
    if (img.uploading) return;
    if (onDeleteServer && img.url) {
      try {
        await onDeleteServer(img.url);
      } catch {
        toast.error("Xóa ảnh thất bại");
        return;
      }
    }
    const next = images.filter((i) => i.id !== img.id);
    if (img.isMain && next.length > 0) {
      next[0] = { ...next[0], isMain: true };
    }
    onChange(next);
  };

  const setMain = (id: string) => {
    onChange(images.map((img) => ({ ...img, isMain: img.id === id })));
  };

  // Placeholder URL đẹp
  const PLACEHOLDER_URL =
    "https://placehold.co/400x400/4b5563/ffffff?text=No+Image";

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
            dragging
              ? "border-primary bg-orange-50"
              : "border-neutral-200 hover:border-primary hover:bg-neutral-50",
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-700">
            Kéo thả hoặc click để chọn ảnh
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            JPG, PNG, WebP • Tối đa {maxSizeMB}MB mỗi ảnh • Còn{" "}
            {maxFiles - images.length} ảnh
          </p>
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 bg-neutral-100",
                img.isMain ? "border-primary" : "border-neutral-100",
                img.error && "border-red-500",
              )}
            >
              {/* Image preview */}
              <img
                src={
                  img.localPreview ??
                  (img.url ? getImageUrl(img.url) : PLACEHOLDER_URL)
                }
                alt={img.error ? "Upload error" : "Uploaded image"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target && target.src !== PLACEHOLDER_URL) {
                    target.src = PLACEHOLDER_URL;
                  }
                }}
              />

              {/* Loading overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-600 text-xs font-medium">
                    Lỗi upload
                  </span>
                </div>
              )}

              {/* Main badge */}
              {img.isMain && !img.uploading && (
                <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Chính
                </div>
              )}

              {/* Actions */}
              {!img.uploading && (
                <div className="absolute bottom-1 right-1 flex gap-1">
                  {!img.isMain && img.url && (
                    <button
                      type="button"
                      onClick={() => setMain(img.id)}
                      title="Đặt làm ảnh chính"
                      className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
                      <Star className="w-3 h-3 text-yellow-500" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    title="Xóa ảnh"
                    className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-neutral-400 text-center">
          Chưa có ảnh nào được tải lên
        </p>
      )}
    </div>
  );
}
