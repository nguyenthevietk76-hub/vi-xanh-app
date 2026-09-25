-- ══════════════════════════════════════════════════════════════
-- Ví Xanh — cấu hình Supabase Storage cho ảnh sản phẩm
-- Chạy 1 lần trong Supabase Dashboard → SQL Editor → New query → Run.
-- Chạy lại nhiều lần vẫn an toàn.
--
-- Đăng nhập của app là FIREBASE. Trước khi chạy file này hãy bật:
--   Authentication → Sign In / Providers → Third-party Auth → Add provider → Firebase
--   Firebase Project ID: vi-dien-tu-xanh
-- Khi đó Supabase chấp nhận Firebase ID token và các policy dưới đây đọc được
-- auth.jwt() của người dùng Firebase (mặc định mang role "anon").
-- ══════════════════════════════════════════════════════════════

-- 1) Bucket công khai: ai cũng XEM được ảnh qua URL công khai,
--    tối đa 5MB mỗi ảnh, chỉ nhận JPG / PNG / WEBP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) Chỉ người dùng Firebase của đúng dự án vi-dien-tu-xanh mới được GHI,
--    và chỉ trong thư mục mang uid của chính mình: product-images/{uid}/...
--    (anon key đơn thuần có iss = supabase → bị chặn).
drop policy if exists "vixanh_images_insert_own" on storage.objects;
create policy "vixanh_images_insert_own"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'product-images'
    and auth.jwt() ->> 'iss' = 'https://securetoken.google.com/vi-dien-tu-xanh'
    and auth.jwt() ->> 'aud' = 'vi-dien-tu-xanh'
    and (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
  );

-- Xem danh sách / xoá ảnh của chính mình (xoá cần cả quyền select)
drop policy if exists "vixanh_images_select_own" on storage.objects;
create policy "vixanh_images_select_own"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'product-images'
    and auth.jwt() ->> 'iss' = 'https://securetoken.google.com/vi-dien-tu-xanh'
    and auth.jwt() ->> 'aud' = 'vi-dien-tu-xanh'
    and (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
  );

drop policy if exists "vixanh_images_delete_own" on storage.objects;
create policy "vixanh_images_delete_own"
  on storage.objects for delete
  to anon, authenticated
  using (
    bucket_id = 'product-images'
    and auth.jwt() ->> 'iss' = 'https://securetoken.google.com/vi-dien-tu-xanh'
    and auth.jwt() ->> 'aud' = 'vi-dien-tu-xanh'
    and (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
  );

-- 3) Kiểm tra: phải thấy bucket product-images và 3 policy vixanh_images_*
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'product-images';
select policyname, cmd, roles from pg_policies where schemaname = 'storage' and policyname like 'vixanh_images_%';
