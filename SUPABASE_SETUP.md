# Cài đặt Supabase để lưu ảnh sản phẩm

Ví Xanh đăng nhập bằng **Firebase**, còn **ảnh sản phẩm lưu trên Supabase Storage** (Firebase Storage cần gói Blaze trả phí nên không dùng).
Làm lần lượt 6 bước dưới đây, mất khoảng 10 phút.

## 1. Tạo dự án Supabase mới
1. Vào <https://supabase.com/dashboard> → **New project**.
2. Đặt tên (vd `vi-xanh`), tự đặt **Database password** và cất kỹ, chọn Region **Southeast Asia (Singapore)** cho nhanh ở Việt Nam.
3. Chờ dự án khởi tạo xong (1–2 phút).

> Gói miễn phí sẽ **tạm dừng dự án nếu 7 ngày không có hoạt động**. Khi bị tạm dừng, ảnh không tải lên/hiển thị được — vào Dashboard bấm **Restore** là chạy lại.

## 2. Cho Supabase nhận tài khoản Firebase
1. Supabase Dashboard → **Authentication** → **Sign In / Providers** → mục **Third-party Auth** → **Add provider** → **Firebase**.
2. Nhập **Firebase Project ID**: `vi-dien-tu-xanh` → Save.

## 3. Tạo bucket và quyền ghi ảnh
1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Dán toàn bộ nội dung file [`supabase/storage-setup.sql`](supabase/storage-setup.sql) → **Run**.
3. Kết quả cuối phải hiện bucket `product-images` (public = true) và 3 policy `vixanh_images_insert_own`, `vixanh_images_select_own`, `vixanh_images_delete_own`.

Quy tắc sau khi chạy:
- Ai cũng **xem** được ảnh (bucket công khai).
- Chỉ người đăng nhập Firebase của dự án `vi-dien-tu-xanh` mới **tải lên**, và chỉ vào thư mục của chính mình (`product-images/{uid}/…`) → brand này không ghi đè/xoá được ảnh của brand khác.
- Mỗi ảnh tối đa 5MB, chỉ JPG/PNG/WEBP (app tự nén ảnh về ~1200px trước khi tải).

## 4. Lấy URL và key
Supabase Dashboard → **Project Settings** → **API** (hoặc **Data API / API Keys**):
- **Project URL** — dạng `https://xxxxxxxx.supabase.co`
- **anon / publishable key** — khoá công khai (KHÔNG dùng `service_role` / secret key).

## 5. Điền vào file `.env` (máy bạn) và Vercel
Trong `vi-xanh-app/.env`, sửa 3 dòng:
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon hoặc publishable key>
VITE_SUPABASE_STORAGE_BUCKET=product-images
```
Rồi vào **Vercel → Project → Settings → Environment Variables**, thêm đúng 3 biến trên (Production + Preview), sau đó **Redeploy**. Nếu không thêm trên Vercel, trang thật vẫn dùng giá trị cũ và vẫn lỗi.

## 6. Kiểm tra
Đăng nhập bằng tài khoản brand đã duyệt → **Bảng điều khiển Brand** → **Sản phẩm** → đăng 1 sản phẩm có ảnh.
Thanh tiến trình chạy tới 100% và sản phẩm hiện trong danh sách là thành công.

| Thông báo lỗi trong app | Cách xử lý |
|---|---|
| Không kết nối được Supabase | Dự án bị tạm dừng/xoá hoặc sai `VITE_SUPABASE_URL` → Restore dự án hoặc sửa URL |
| Supabase chưa nhận tài khoản Firebase | Chưa làm bước 2, hoặc nhập sai Project ID |
| Supabase từ chối tải ảnh (policy) | Chưa chạy bước 3, hoặc sửa tay sai Project ID trong file SQL |
| Supabase chưa có bucket | Chưa chạy bước 3 |
| Chưa cấu hình Supabase | Thiếu biến trong `.env` / Vercel (bước 5) |
