/* ══════════════════════════════════════════
   MOCK DATA — Ví Xanh
   Products, Transactions, Impact, Exchange Rates
   ══════════════════════════════════════════ */

// ── Product images (High-resolution Eco Assets) ──
const PRODUCT_IMG = {
  binh: '/images/products/binh_giu_nhiet.jpg',
  tui: '/images/products/tui_canvas.jpg',
  chau: '/images/products/chau_sen_da.jpg',
  ong_hut: '/images/products/ong_hut_inox.jpg',
  vong_tay: '/images/products/vong_tay_handmade.jpg',
  so_tay: '/images/products/so_tay_tai_che.jpg',
  nen: '/images/products/nen_sap_ong.jpg',
  khan: '/images/products/khan_soi_tre.jpg',
  tui_luoi: '/images/products/tui_luoi_cotton.jpg',
  thia: '/images/products/bo_thia_go_dua.jpg',
  thung_rac: '/images/products/thung_rac_phan_loai.jpg',
  den: '/images/products/den_nang_luong.jpg',
  banner_flash_sale: '/images/banners/banner_flash_sale.jpg',
  hero_collection: '/images/banners/banner_flash_sale.jpg',
};
const STITCH_IMG = PRODUCT_IMG;


// ── Exchange Rates ──
// Bảng quy đổi thu gom nằm ở src/lib/points.js (khớp slide & firestore.rules)
import { TRADE_IN_RATES } from '../lib/points';
export const EXCHANGE_RATES = TRADE_IN_RATES;

// ── Collection Points ──
export const COLLECTION_POINTS = [
  { name: 'Điểm EcoHub Hoàn Kiếm', address: 'Số 14 Đinh Lễ, Tràng Tiền, Hà Nội', distance: '1.2 km' },
  { name: 'Điểm Xanh Cầu Giấy', address: 'Tầng 1 TTTM IPH, 241 Xuân Thủy, Cầu Giấy', distance: '3.8 km' },
  { name: 'Trạm Quy Đổi Q1', address: '68 Nguyễn Huệ, Quận 1, TP.HCM', distance: '0.5 km' },
];

// ── Products Catalog ──
export const PRODUCTS = [
  {
    id: 'p1', name: 'Bình giữ nhiệt tái chế', category: 'Bình nước',
    priceVND: 180000, priceOriginal: 240000, points: 180,
    image: STITCH_IMG.binh, rating: 4.9, reviews: 128,
    badge: 'sale', salePercent: 25, stock: 12,
    weeklyRedeemed: 128, isNew: false,
    desc: 'Bình giữ nhiệt Eco Bamboo 500ml, thép không gỉ 304, giữ nóng 12h / lạnh 24h.'
  },
  {
    id: 'p2', name: 'Túi vải canvas hữu cơ', category: 'Túi vải',
    priceVND: 120000, priceOriginal: null, points: 120,
    image: STITCH_IMG.tui, rating: 4.8, reviews: 96,
    badge: 'hot', stock: 34,
    weeklyRedeemed: 96, isNew: false,
    desc: 'Túi tote vải mộc Organic, thân thiện môi trường, sức chứa 15L.'
  },
  {
    id: 'p3', name: 'Chậu cây tái chế', category: 'Cây xanh',
    priceVND: 160000, priceOriginal: 195000, points: 160,
    image: STITCH_IMG.chau, rating: 5.0, reviews: 42,
    badge: 'hot', stock: 8,
    weeklyRedeemed: 42, isNew: false,
    desc: 'Bộ chậu sen đá đất nung mini, dành riêng cho thành viên xanh.'
  },
  {
    id: 'p4', name: 'Ống hút inox bộ 4', category: 'Đồ gia dụng',
    priceVND: 65000, priceOriginal: null, points: 65,
    image: STITCH_IMG.ong_hut, rating: 4.7, reviews: 35,
    badge: 'new', stock: 50,
    weeklyRedeemed: 35, isNew: true,
    desc: 'Bộ 4 ống hút inox kèm cọ rửa, túi đựng vải canvas.'
  },
  {
    id: 'p5', name: 'Vòng tay handmade tái chế', category: 'Túi vải',
    priceVND: 45000, priceOriginal: null, points: 45,
    image: STITCH_IMG.vong_tay, rating: 4.6, reviews: 21,
    badge: null, stock: 28,
    weeklyRedeemed: 21, isNew: false,
    desc: 'Vòng tay thủ công từ nhựa tái chế, mỗi chiếc là duy nhất.'
  },
  {
    id: 'p6', name: 'Sổ tay giấy tái chế', category: 'Đồ gia dụng',
    priceVND: 55000, priceOriginal: 65000, points: 55,
    image: STITCH_IMG.so_tay, rating: 4.9, reviews: 74,
    badge: 'sale', salePercent: 15, stock: 45,
    weeklyRedeemed: 74, isNew: false,
    desc: 'Sổ tay Ví Xanh, giấy tái chế 100%, bìa kraft thân thiện.'
  },
  {
    id: 'p7', name: 'Nến sáp ong thủ công', category: 'Đồ gia dụng',
    priceVND: 145000, priceOriginal: null, points: 145,
    image: STITCH_IMG.nen, rating: 4.8, reviews: 53,
    badge: 'hot', stock: 15,
    weeklyRedeemed: 53, isNew: false,
    desc: 'Nến sáp ong nguyên chất, hương oải hương tự nhiên, cháy 40h.'
  },
  {
    id: 'p8', name: 'Khăn tre kháng khuẩn', category: 'Túi vải',
    priceVND: 85000, priceOriginal: null, points: 85,
    image: STITCH_IMG.khan, rating: 4.7, reviews: 19,
    badge: 'new', stock: 60,
    weeklyRedeemed: 19, isNew: true,
    desc: 'Khăn mặt sợi tre tự nhiên, kháng khuẩn, siêu thấm hút.'
  },
  {
    id: 'p9', name: 'Túi lưới đi chợ bộ 3', category: 'Túi vải',
    priceVND: 95000, priceOriginal: null, points: 95,
    image: STITCH_IMG.tui_luoi, rating: 4.8, reviews: 68,
    badge: null, stock: 38,
    weeklyRedeemed: 68, isNew: false,
    desc: 'Bộ 3 túi lưới cotton đi chợ, thay thế hoàn toàn túi nilon.'
  },
  {
    id: 'p10', name: 'Bộ thìa đĩa gỗ dừa Bến Tre', category: 'Đồ gia dụng',
    priceVND: 75000, priceOriginal: 90000, points: 75,
    image: STITCH_IMG.thia, rating: 4.9, reviews: 41,
    badge: 'new', stock: 22,
    weeklyRedeemed: 41, isNew: false,
    desc: 'Thìa đĩa gỗ dừa thủ công Bến Tre, an toàn thực phẩm.'
  },
  {
    id: 'p11', name: 'Thùng phân loại rác gia đình', category: 'Đồ gia dụng',
    priceVND: 490000, priceOriginal: 550000, points: 490,
    image: STITCH_IMG.thung_rac, rating: 4.5, reviews: 12,
    badge: 'sale', salePercent: 10, stock: 5,
    weeklyRedeemed: 12, isNew: false,
    desc: 'Thùng phân loại rác 3 ngăn, nhựa tái chế, có nhãn phân loại.'
  },
  {
    id: 'p12', name: 'Đèn bàn năng lượng mặt trời', category: 'Đồ gia dụng',
    priceVND: 850000, priceOriginal: 950000, points: 850,
    image: STITCH_IMG.den, rating: 4.6, reviews: 8,
    badge: null, stock: 3,
    weeklyRedeemed: 8, isNew: false,
    desc: 'Đèn bàn LED sạc bằng năng lượng mặt trời, 3 chế độ sáng.'
  },
];

// ── Initial Transactions ──
export const INITIAL_TRANSACTIONS = [
  { id: 't1', type: 'trade-in', desc: 'Đổi 2kg quần áo loại A – Điểm thu gom Cầu Giấy', points: 30, date: '2026-09-24T14:30:00', category: 'clothes_a', weight: 2 },
  { id: 't2', type: 'redeem', desc: 'Đổi Bình giữ nhiệt tái chế 500ml – Đơn hàng #VX-8921', points: -180, date: '2026-09-20T09:15:00', orderId: 'VX-8921', productId: 'p1' },
  { id: 't3', type: 'trade-in', desc: 'Đổi 5kg bã cà phê – Điểm thu gom Hoàn Kiếm', points: 10, date: '2026-09-15T16:00:00', category: 'coffee', weight: 5 },
  { id: 't4', type: 'bonus', desc: 'Thưởng phân loại rác tuần xanh – Chương trình hành động', points: 5, date: '2026-09-10T10:00:00' },
  { id: 't5', type: 'redeem', desc: 'Đổi Túi vải canvas Eco-Life – Đơn hàng #VX-8710', points: -120, date: '2026-09-02T11:20:00', orderId: 'VX-8710', productId: 'p2' },
  { id: 't6', type: 'trade-in', desc: 'Đổi 4kg quần áo loại B – Điểm thu gom Q1', points: 32, date: '2026-08-28T15:45:00', category: 'clothes_b', weight: 4 },
  { id: 't7', type: 'bonus', desc: 'Hoàn thành thử thách 7 ngày xanh', points: 10, date: '2026-08-22T09:00:00' },
  { id: 't8', type: 'trade-in', desc: 'Đổi 5kg quần áo loại C – Điểm thu gom Cầu Giấy', points: 15, date: '2026-08-15T13:20:00', category: 'clothes_c', weight: 5 },
  { id: 't9', type: 'redeem', desc: 'Đổi Sổ tay giấy tái chế – Đơn hàng #VX-8650', points: -55, date: '2026-08-10T17:30:00', orderId: 'VX-8650', productId: 'p6' },
  { id: 't10', type: 'trade-in', desc: 'Đổi 3kg quần áo loại B – Điểm thu gom Hoàn Kiếm', points: 24, date: '2026-08-05T10:10:00', category: 'clothes_b', weight: 3 },
];

// ── Impact Data ──
export const INITIAL_IMPACT = {
  totalKgRecycled: 14820,
  co2SavedKg: 4200,
  treesEquivalent: 15000,
  usersCount: 42000,
  collectionPoints: 86,
  citiesCount: 12,
  weeklyData: [32, 45, 38, 52, 48, 61, 58],  // last 7 days CO2 in kg
  monthlyPoints: [28, 45, 32, 38, 52, 61],  // last 6 months
  quarterGoal: 78,  // percent
};

// ── Vouchers ──
export const VOUCHERS = [
  { id: 'v1', title: 'Giảm 20% đơn hàng tiếp theo', code: 'GREEN20', expiresAt: '2026-12-31', minPoints: 50 },
  { id: 'v2', title: 'Miễn phí vận chuyển', code: 'FREESHIP', expiresAt: '2026-10-31', minPoints: 20 },
  { id: 'v3', title: 'Tặng thêm 5 điểm bonus', code: 'BONUS5', expiresAt: '2026-11-15', minPoints: 10 },
];

// ── Milestones ──
export const MILESTONES = [
  { id: 'm1', title: 'Người mới bắt đầu', desc: 'Đổi đồ cũ lần đầu tiên', achieved: true, icon: 'eco' },
  { id: 'm2', title: 'Nhà tái chế', desc: 'Đổi tổng cộng 10kg đồ cũ', achieved: true, icon: 'recycling' },
  { id: 'm3', title: 'Chiến binh xanh', desc: 'Đổi tổng cộng 50kg đồ cũ', achieved: false, icon: 'military_tech' },
  { id: 'm4', title: 'Hội viên Bạc', desc: 'Tích lũy 300 điểm xanh', achieved: true, icon: 'workspace_premium' },
];

// ── Project/Campaign Data ──
export const CAMPAIGNS = [
  {
    id: 'c1',
    title: 'Làm sạch Việt Nam khỏi rác thải nhựa',
    subtitle: 'Dự án hành động 2026–2030',
    goal: 1000000, // kg
    current: 128000,
    partners: ['GreenU', 'Panasonic', 'EcoCorp'],
  },
];

// ── Categories for filters ──
export const CATEGORIES = [
  { id: 'all', name: 'Tất cả', count: PRODUCTS.length },
  { id: 'Bình nước', name: 'Bình nước', count: PRODUCTS.filter(p => p.category === 'Bình nước').length },
  { id: 'Túi vải', name: 'Túi vải', count: PRODUCTS.filter(p => p.category === 'Túi vải').length },
  { id: 'Đồ gia dụng', name: 'Đồ gia dụng', count: PRODUCTS.filter(p => p.category === 'Đồ gia dụng').length },
  { id: 'Cây xanh', name: 'Cây xanh', count: PRODUCTS.filter(p => p.category === 'Cây xanh').length },
];

export const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'sale', label: 'Đang giảm giá' },
  { id: 'points-only', label: 'Đổi bằng điểm' },
  { id: 'new', label: 'Hàng mới về' },
  { id: 'combo', label: 'Combo tiết kiệm' },
];
