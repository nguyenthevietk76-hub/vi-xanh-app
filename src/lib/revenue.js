/* ══════════════════════════════════════════
   DOANH THU — dùng chung cho Bảng điều khiển Brand và trang Quản trị
   Quy ước (chỉ đơn mua bằng VNĐ, type = 'buy'):
   - Giá bán      = priceVND × quantity  (= khách trả + phần giảm bằng điểm)
   - Khách trả    = totalVND
   - Giảm bằng điểm = discountVND (điểm xanh khách dùng làm mã giảm giá)
   - Chỉ đơn "Hoàn thành" mới tính là doanh thu; đơn đang xử lý tính riêng; đơn huỷ bỏ qua.
   Đơn đổi quà bằng điểm (type = 'redeem') không có doanh thu VNĐ, chỉ đếm số lượt & số điểm.
   ══════════════════════════════════════════ */
import {
  collection, query, where, getAggregateFromServer, getCountFromServer, sum, count,
} from 'firebase/firestore';
import { db } from './firebase';

export const OPEN_STATUSES = ['pending', 'confirmed', 'shipping'];

export const ORDER_STATUS_MAP = {
  pending:   { label: 'Chờ xử lý',   variant: 'default' },
  confirmed: { label: 'Đã xác nhận', variant: 'eco' },
  shipping:  { label: 'Đang giao',   variant: 'delivery' },
  completed: { label: 'Hoàn thành',  variant: 'milestone' },
  cancelled: { label: 'Đã huỷ',      variant: 'reject' },
};

export const formatVND = (n) => `${Math.round(n || 0).toLocaleString('vi-VN')}đ`;

// Rút gọn số tiền cho thẻ số liệu: 1.250.000 → "1,25 tr"
export function formatShortVND(n) {
  const v = Math.round(n || 0);
  if (v >= 1e9) return `${(v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr`;
  if (v >= 1e3) return `${Math.round(v / 1e3).toLocaleString('vi-VN')}k`;
  return `${v}đ`;
}

export const orderType = (o) => o.type || 'buy';
export const orderTimeMs = (o) => o.createdAt?.toMillis?.() ?? Date.now();
export const orderPaid = (o) => o.totalVND || 0;
export const orderDiscount = (o) => o.discountVND || 0;
export const orderGross = (o) => (o.priceVND ? o.priceVND * (o.quantity || 1) : orderPaid(o) + orderDiscount(o));

// Tổng hợp danh sách đơn (phía client) trong khoảng [sinceMs, now]
export function summarizeOrders(orders, { sinceMs = 0, days = 30 } = {}) {
  const s = {
    completedCount: 0, grossVND: 0, paidVND: 0, discountVND: 0,
    openCount: 0, openVND: 0, cancelledCount: 0,
    redeemCount: 0, redeemPoints: 0, unpaidTransfers: 0,
    byDay: [], topProducts: [],
  };
  const now = new Date();
  const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const dayBuckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    dayBuckets.set(dayKey(d), { date: d, grossVND: 0, orders: 0 });
  }
  const products = new Map();

  for (const o of orders) {
    const t = orderTimeMs(o);
    if (t < sinceMs) continue;
    if (orderType(o) === 'redeem') {
      if (o.status !== 'cancelled') { s.redeemCount += 1; s.redeemPoints += o.pointsUsed || 0; }
      continue;
    }
    if (o.status === 'cancelled') { s.cancelledCount += 1; continue; }
    if (o.paymentStatus === 'unpaid') s.unpaidTransfers += 1;
    if (OPEN_STATUSES.includes(o.status)) { s.openCount += 1; s.openVND += orderGross(o); continue; }
    if (o.status !== 'completed') continue;

    s.completedCount += 1;
    s.grossVND += orderGross(o);
    s.paidVND += orderPaid(o);
    s.discountVND += orderDiscount(o);

    const bucket = dayBuckets.get(dayKey(new Date(t)));
    if (bucket) { bucket.grossVND += orderGross(o); bucket.orders += 1; }

    const key = o.productId || o.productName;
    const p = products.get(key) || { id: key, name: o.productName, image: o.productImage, qty: 0, grossVND: 0 };
    p.qty += o.quantity || 1;
    p.grossVND += orderGross(o);
    products.set(key, p);
  }
  s.byDay = [...dayBuckets.values()];
  s.topProducts = [...products.values()].sort((a, b) => b.grossVND - a.grossVND).slice(0, 5);
  return s;
}

/* ── Tổng hợp phía server (Firestore aggregation) — không phải tải từng đơn về ──
   Chỉ dùng bộ lọc bằng (==) để Firestore tự ghép index, không cần tạo composite index. */
async function aggregateCompleted(filters) {
  const q = query(collection(db, 'orders'), ...filters, where('type', '==', 'buy'), where('status', '==', 'completed'));
  const snap = await getAggregateFromServer(q, { paid: sum('totalVND'), discount: sum('discountVND'), n: count() });
  const d = snap.data();
  return { paidVND: d.paid || 0, discountVND: d.discount || 0, grossVND: (d.paid || 0) + (d.discount || 0), completedCount: d.n || 0 };
}

async function countOpen(filters) {
  const results = await Promise.all(OPEN_STATUSES.map(st =>
    getCountFromServer(query(collection(db, 'orders'), ...filters, where('status', '==', st)))));
  return results.reduce((acc, r) => acc + r.data().count, 0);
}

// Tổng quan 1 brand (dùng cho trang Quản trị)
export async function fetchBrandTotals(brandId) {
  const byBrand = [where('brandId', '==', brandId)];
  const [completed, openCount, productsSnap] = await Promise.all([
    aggregateCompleted(byBrand),
    countOpen(byBrand),
    getCountFromServer(query(collection(db, 'products'), where('brandId', '==', brandId))),
  ]);
  return { ...completed, openCount, productCount: productsSnap.data().count };
}

// Tổng quan toàn sàn
export async function fetchPlatformTotals() {
  const [completed, openCount, products, users, redeem] = await Promise.all([
    aggregateCompleted([]),
    countOpen([]),
    getCountFromServer(collection(db, 'products')),
    getCountFromServer(collection(db, 'users')),
    getAggregateFromServer(query(collection(db, 'orders'), where('type', '==', 'redeem')), { points: sum('pointsUsed'), n: count() }),
  ]);
  return {
    ...completed,
    openCount,
    productCount: products.data().count,
    userCount: users.data().count,
    redeemCount: redeem.data().n || 0,
    redeemPoints: redeem.data().points || 0,
  };
}

// Xuất CSV (mở được bằng Excel — có BOM UTF-8 để giữ dấu tiếng Việt)
export function downloadCSV(filename, rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = '﻿' + rows.map(r => r.map(esc).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
