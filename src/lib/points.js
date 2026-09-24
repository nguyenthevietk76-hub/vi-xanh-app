/* ══════════════════════════════════════════
   QUY ĐỔI ĐIỂM XANH — nguồn duy nhất cho mọi con số về điểm
   Khớp với slide "04 · Bảng quy đổi điểm" và firestore.rules.
   Nếu đổi số ở đây, nhớ đổi hằng số tương ứng trong firestore.rules.
   ══════════════════════════════════════════ */

// 1 điểm xanh ≈ 1.000đ
export const POINT_VALUE_VND = 1000;

// Điểm chào mừng cho tài khoản mới (firestore.rules: WELCOME_POINTS)
export const WELCOME_POINTS = 20;

// Thưởng khi mua bằng VNĐ: 1 điểm cho mỗi 10.000đ, cộng khi đơn hoàn tất
// (firestore.rules: BONUS_VND_PER_POINT)
export const BONUS_VND_PER_POINT = 10000;

// Bảng quy đổi thu gom — id phải trùng danh sách trong firestore.rules
export const TRADE_IN_RATES = [
  { id: 'clothes_a', name: 'Quần áo cũ – Loại A', shortName: 'Quần áo loại A', rate: 15, unit: 'điểm/kg', icon: 'checkroom', desc: 'Còn mới ≥ 80%, không hư hỏng' },
  { id: 'clothes_b', name: 'Quần áo cũ – Loại B', shortName: 'Quần áo loại B', rate: 8, unit: 'điểm/kg', icon: 'checkroom', desc: 'Còn dùng tốt, 50–79%' },
  { id: 'clothes_c', name: 'Quần áo cũ – Loại C', shortName: 'Quần áo loại C', rate: 3, unit: 'điểm/kg', icon: 'checkroom', desc: 'Dưới 50%, làm nguyên liệu tái chế' },
  { id: 'coffee', name: 'Bã cà phê', shortName: 'Bã cà phê', rate: 2, unit: 'điểm/kg', icon: 'coffee', desc: 'Thu gom khô, chưa lẫn tạp chất' },
];

export const TRADE_IN_MIN_KG = 0.5;
export const TRADE_IN_MAX_KG = 50;

// Hệ số CO₂ ước tính (kg CO₂ giảm / kg thu gom) — chỉ để hiển thị
const CO2_FACTOR = { clothes_a: 1.6, clothes_b: 1.6, clothes_c: 1.6, coffee: 0.5 };

export function getTradeInRate(id) {
  return TRADE_IN_RATES.find(r => r.id === id) || null;
}

export function calcTradeInPoints(categoryId, weightKg) {
  const rate = getTradeInRate(categoryId);
  if (!rate || !(weightKg > 0)) return 0;
  return Math.round(rate.rate * weightKg);
}

export function calcCo2Saved(categoryId, weightKg) {
  const f = CO2_FACTOR[categoryId] ?? 1;
  return Math.round(weightKg * f * 10) / 10;
}

export function calcBonusPoints(totalVND) {
  return Math.floor((Number(totalVND) || 0) / BONUS_VND_PER_POINT);
}

export function pointsToVND(points) {
  return Math.max(0, Math.round(points || 0)) * POINT_VALUE_VND;
}

// Giá đổi điểm mặc định của sản phẩm = giá VNĐ ÷ 1.000 (làm tròn lên)
export function vndToPoints(priceVND) {
  return Math.ceil((Number(priceVND) || 0) / POINT_VALUE_VND);
}
