'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadService } from '@/services/upload.service';

export function useUploadImage() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      return url;
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload ảnh thất bại');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}

export function useUploadImages() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, 'uploading' | 'done' | 'error'>>({});

  const upload = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    const urls: string[] = [];

    for (const file of files) {
      const key = file.name;
      setProgress((prev) => ({ ...prev, [key]: 'uploading' }));
      try {
        const url = await uploadService.uploadImage(file);
        urls.push(url);
        setProgress((prev) => ({ ...prev, [key]: 'done' }));
      } catch {
        setProgress((prev) => ({ ...prev, [key]: 'error' }));
        toast.error(`Upload ${file.name} thất bại`);
      }
    }

    setIsUploading(false);
    return urls;
  };

  return { upload, isUploading, progress };
}

export function useUploadAvatar() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const url = await uploadService.uploadAvatar(file);
      return url;
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload ảnh thất bại');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}
