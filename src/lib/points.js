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
export const CO2_FACTOR = { clothes_a: 1.6, clothes_b: 1.6, clothes_c: 1.6, coffee: 0.5 };

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

/* ── Dùng điểm khi mua hàng ──
   Sản phẩm thường: điểm chỉ là MÃ GIẢM GIÁ (1 điểm = POINT_VALUE_VND), mỗi đơn được giảm
   tối đa MAX_DISCOUNT_PERCENT% giá trị đơn VÀ không quá MAX_POINTS_PER_ORDER điểm — lấy mức thấp hơn.
   Ví dụ: đơn 150.000đ → tối đa 75 điểm; đơn 600.000đ → tối đa 200 điểm.
   Chỉ sản phẩm độc quyền (redeemOnly) mới đổi hoàn toàn bằng điểm.
   (firestore.rules: MAX_POINTS_PER_ORDER, MAX_DISCOUNT_PERCENT, POINT_VALUE_VND) */
export const MAX_POINTS_PER_ORDER = 200;
export const MAX_DISCOUNT_PERCENT = 50;

export function isRedeemOnly(product) {
  return product?.redeemOnly === true;
}

// Số điểm tối đa được dùng để giảm giá cho 1 đơn có tổng tiền subtotalVND
export function maxDiscountPoints(subtotalVND, balance = Infinity) {
  const byPercent = Math.floor(((Number(subtotalVND) || 0) * MAX_DISCOUNT_PERCENT) / 100 / POINT_VALUE_VND);
  return Math.max(0, Math.min(MAX_POINTS_PER_ORDER, Math.floor(balance) || 0, byPercent));
}

// Mô tả ngắn quy tắc giảm giá để hiển thị trên giao diện
export const DISCOUNT_RULE_TEXT = `tối đa ${MAX_DISCOUNT_PERCENT}% giá trị đơn, không quá ${MAX_POINTS_PER_ORDER} điểm`;
