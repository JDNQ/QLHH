import api from "@/lib/axios";
import type { UploadImageResponse, UploadImagesResponse } from "@/types";

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("🔄 Đang upload file:", file.name);

      const res = await api.post<{ data: UploadImageResponse }>(
        "/upload/image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const returnedUrl = res.data.data.url;
      console.log("✅ Backend trả về URL:", returnedUrl);
      console.log("📦 Full response:", res.data);

      return returnedUrl;
    } catch (error: any) {
      console.error(
        "❌ Upload error:",
        error.response?.data || error.message || error,
      );
      throw error;
    }
  },

  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const res = await api.post<{ data: UploadImagesResponse }>(
      "/upload/images",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data.data.urls;
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<{ data: UploadImageResponse }>(
      "/upload/avatar",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data.data.url;
  },
};
