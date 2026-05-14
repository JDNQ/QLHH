import api from '@/lib/axios';
import type { UploadImageResponse, UploadImagesResponse } from '@/types';

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ data: UploadImageResponse }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },

  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await api.post<{ data: UploadImagesResponse }>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.urls;
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ data: UploadImageResponse }>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },
};
