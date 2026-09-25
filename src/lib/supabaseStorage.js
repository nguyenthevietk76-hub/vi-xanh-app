/* ══════════════════════════════════════════
   LƯU ẢNH SẢN PHẨM TRÊN SUPABASE STORAGE
   - Đăng nhập vẫn là Firebase. Supabase nhận diện người dùng qua Firebase ID token
     (Supabase → Authentication → Third-party Auth → Firebase). Xem SUPABASE_SETUP.md.
   - Mỗi brand chỉ ghi được vào thư mục của mình: {bucket}/{firebaseUid}/...
     (policy trong supabase/storage-setup.sql).
   - Gọi thẳng Storage REST API bằng XMLHttpRequest để có % tiến trình, không cần cài SDK.
   ══════════════════════════════════════════ */
import { auth } from './firebase';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images';

export const isStorageConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const MAX_SOURCE_MB = 20;   // ảnh gốc người dùng chọn
export const MAX_UPLOAD_MB = 5;    // sau khi nén — khớp file_size_limit của bucket
const UPLOAD_TIMEOUT_MS = 60000;
const DECODE_TIMEOUT_MS = 20000;

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Nén về JPEG, cạnh dài tối đa maxSize px. Luôn kết thúc (resolve/reject), không bao giờ treo.
export function compressImage(file, maxSize = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Chưa chọn ảnh.'));
    const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
    if (isHeic) return reject(new Error('Ảnh HEIC (iPhone) chưa được hỗ trợ. Hãy chọn ảnh JPG hoặc PNG.'));
    if (file.type && !file.type.startsWith('image/')) return reject(new Error('Tệp đã chọn không phải là ảnh.'));
    if (file.size > MAX_SOURCE_MB * 1024 * 1024) return reject(new Error(`Ảnh quá lớn (tối đa ${MAX_SOURCE_MB}MB).`));

    const url = URL.createObjectURL(file);
    const img = new Image();
    const timer = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('Không đọc được ảnh (quá lâu). Hãy thử ảnh khác.'));
    }, DECODE_TIMEOUT_MS);

    img.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      reject(new Error('Không đọc được ảnh. Hãy chọn ảnh JPG, PNG hoặc WEBP.'));
    };
    img.onload = () => {
      clearTimeout(timer);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; // nền trắng cho ảnh PNG trong suốt
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Không nén được ảnh. Hãy thử ảnh khác.'));
        if (blob.size > MAX_UPLOAD_MB * 1024 * 1024) return reject(new Error(`Ảnh sau khi nén vẫn lớn hơn ${MAX_UPLOAD_MB}MB.`));
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    img.src = url;
  });
}

function publicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// Đổi lỗi kỹ thuật của Supabase thành câu dễ hiểu, kèm gợi ý cách sửa
function explainError(status, body) {
  const msg = String(body?.message || body?.error || '').toLowerCase();
  if (msg.includes('bucket not found')) {
    return `Supabase chưa có bucket "${BUCKET}". Hãy chạy file supabase/storage-setup.sql (xem SUPABASE_SETUP.md).`;
  }
  if (status === 401 || msg.includes('jwt') || msg.includes('signature') || msg.includes('unauthorized')) {
    return 'Supabase chưa nhận tài khoản Firebase. Hãy bật Third-party Auth → Firebase trong Supabase (xem SUPABASE_SETUP.md).';
  }
  if (status === 403 || msg.includes('row-level security') || msg.includes('policy')) {
    return 'Supabase từ chối tải ảnh (policy). Hãy chạy lại supabase/storage-setup.sql với đúng Firebase Project ID.';
  }
  if (status === 413 || msg.includes('too large') || msg.includes('maximum allowed size')) {
    return `Ảnh vượt giới hạn ${MAX_UPLOAD_MB}MB của bucket.`;
  }
  if (msg.includes('mime') || msg.includes('invalid_mime_type')) {
    return 'Định dạng ảnh không được bucket cho phép (chỉ JPG, PNG, WEBP).';
  }
  if (status === 409 || msg.includes('already exists')) {
    return 'Tên ảnh bị trùng, vui lòng thử lại.';
  }
  return `Tải ảnh thất bại (mã ${status || 'mạng'}${body?.message ? `: ${body.message}` : ''}).`;
}

/**
 * Nén và tải ảnh sản phẩm lên Supabase. Trả về URL công khai của ảnh.
 * onProgress(0..100) được gọi trong lúc tải.
 */
export async function uploadProductImage(file, { onProgress } = {}) {
  if (!isStorageConfigured) {
    throw new Error('Chưa cấu hình Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY trong .env / Vercel).');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('Bạn cần đăng nhập để tải ảnh.');

  onProgress?.(0);
  const blob = await compressImage(file);
  const token = await user.getIdToken();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${user.uid}/${Date.now()}-${rand}.jpg`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader('apikey', SUPABASE_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'image/jpeg');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', 'max-age=31536000');
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(publicUrl(path));
        return;
      }
      let body = null;
      try { body = JSON.parse(xhr.responseText); } catch { /* không phải JSON */ }
      reject(new Error(explainError(xhr.status, body)));
    };
    xhr.onerror = () => reject(new Error('Không kết nối được Supabase. Kiểm tra dự án Supabase còn hoạt động (không bị tạm dừng) và VITE_SUPABASE_URL đúng.'));
    xhr.ontimeout = () => reject(new Error('Tải ảnh quá lâu (quá 60 giây). Kiểm tra mạng rồi thử lại.'));
    xhr.send(blob);
  });
}

// Xoá ảnh cũ khi sửa/xoá sản phẩm — chỉ xoá ảnh nằm trong bucket của Ví Xanh, lỗi thì bỏ qua.
export async function deleteProductImage(imageUrl) {
  if (!isStorageConfigured || !imageUrl) return;
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!imageUrl.startsWith(prefix)) return;
  const path = imageUrl.slice(prefix.length);
  const user = auth.currentUser;
  if (!user || !path.startsWith(`${user.uid}/`)) return;
  try {
    const token = await user.getIdToken();
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.warn('Không xoá được ảnh cũ trên Supabase:', err);
  }
}
