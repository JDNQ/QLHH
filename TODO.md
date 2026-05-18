# TODO - Seed thêm nhiều dữ liệu để test

## Kế hoạch

- [ ] Cập nhật `goods-manager/backend/prisma/seed.ts` để seed thêm 60-100 posts (trộn status/featured/views/giá/vị trí).

- [x] Với mỗi post: tạo 1-3 quan hệ category qua `postCategory.upsert` (key `postId_categoryId`).

- [x] (Tùy chọn) Seed `post_images` cho mỗi post (1-3 ảnh giả) để test UI chi tiết.

- [ ] Đảm bảo seed chạy lặp lại không trùng lặp: dùng `upsert` theo `slug`.

## Follow-up

- [ ] Chạy `npm run seed` trong `goods-manager/backend`.
- [ ] Kiểm tra listing (public) và admin stats/filter để thấy nhiều dữ liệu.
