// ── VietQR (Napas 24/7) — tạo mã QR chuyển khoản ngân hàng ──
// Docs: https://www.vietqr.io/danh-sach-api/link-tao-ma-nhanh
//
// Đây là cách phù hợp nhất cho một shop cá nhân / dự án không có tài khoản
// merchant: chỉ cần số tài khoản ngân hàng cá nhân, không cần cổng thanh toán,
// không cần backend riêng — ảnh QR được dựng thẳng từ 1 URL.

// Cấu hình lấy từ .env (xem .env.example) — KHÔNG hardcode số tài khoản trong code.
const BANK_ID = import.meta.env.VITE_BANK_ID || '';
const ACCOUNT_NO = import.meta.env.VITE_BANK_ACCOUNT_NO || '';
const ACCOUNT_NAME = import.meta.env.VITE_BANK_ACCOUNT_NAME || '';

export const isVietQRConfigured = Boolean(BANK_ID && ACCOUNT_NO && ACCOUNT_NAME);

// API yêu cầu addInfo/accountName không dấu, tối đa 25 ký tự cho addInfo.
function stripDiacritics(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
}

// Sinh mã đơn hàng ngắn dùng làm nội dung chuyển khoản, để đối chiếu đơn
// với giao dịch ngân hàng thực tế (vd: VX48213).
export function generateOrderCode() {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `VX${rand}`;
}

// Trả về URL ảnh QR (img.vietqr.io Quick Link), sẵn sàng dùng trong <img src>.
// template: 'compact2' (có logo ngân hàng + số tiền, gọn) — có thể đổi sang
// 'compact' | 'qr_only' | 'print' tuỳ ý.
export function getVietQRUrl({ amount, orderCode, template = 'compact2' }) {
  if (!isVietQRConfigured) return null;
  const addInfo = stripDiacritics(`Thanh toan don ${orderCode}`).slice(0, 25);
  const accountName = stripDiacritics(ACCOUNT_NAME);
  const params = new URLSearchParams({
    amount: String(Math.round(amount || 0)),
    addInfo,
    accountName,
  });
  return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${template}.png?${params.toString()}`;
}

export const vietqrBankLabel = ACCOUNT_NAME;
