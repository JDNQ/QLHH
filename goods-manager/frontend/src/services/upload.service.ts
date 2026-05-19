import api from "@/lib/axios";
import type { UploadImageResponse, UploadImagesResponse } from "@/types";

type UploadEnvelope<T> = { data?: T } & Partial<T>;

function normalizeUploadUrl(raw?: string): string {
  if (!raw) return "";

  // Đã là URL đầy đủ hoặc blob → giữ nguyên
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  // Lấy storage URL từ env (KHÔNG có /api ở cuối)
  const storageBase =
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:8000";

  // Chuẩn hóa path
  let path = raw;
  if (!path.startsWith("/uploads/")) {
    if (path.startsWith("uploads/")) {
      path = `/${path}`;
    } else {
      path = `/uploads/${path.replace(/^\//, "")}`;
    }
  }

  return `${storageBase}${path}`;
}

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<UploadEnvelope<UploadImageResponse>>(
      "/upload/image",
      formData,
    );

    return normalizeUploadUrl(res.data?.data?.url ?? res.data?.url);
  },

  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const res = await api.post<UploadEnvelope<UploadImagesResponse>>(
      "/upload/images",
      formData,
    );

    const urls = res.data?.data?.urls ?? res.data?.urls ?? [];
    return urls.map((url) => normalizeUploadUrl(url)).filter(Boolean);
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<UploadEnvelope<UploadImageResponse>>(
      "/upload/avatar",
      formData,
    );
    console.log("=== UPLOAD RESPONSE ===", JSON.stringify(res.data));
    return normalizeUploadUrl(res.data?.data?.url ?? res.data?.url);
  },
};
