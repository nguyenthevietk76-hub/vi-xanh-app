/* ══════════════════════════════════════════
   MOCK DATA — Ví Xanh
   Products, Transactions, Impact, Exchange Rates
   ══════════════════════════════════════════ */

// ── Product images from Stitch CDN ──
const STITCH_IMG = {
  binh: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJqc4xXp39sOlVaJVPrmRr2rqhQIQCKxdKiDG5aBW5LiXTHfOdATm7Lz9fvW5aR8YnWuKV7JdGb7eNjSjR3NXX4C_-L1MebbDVVV-HqJnDWA25oWw2lfYN99-nz1nrJlpRCz5h3Ec7-5AexfxsyRm2VFgvEEp7_y6BQG5rWv3E0vXK_-pNqndshDN1Zci08NeXbYH_1NfxH7vJvFcZG-Ot0RnqKwFkPU-Ny2TDZfqk7WbRkBbcx7p',
  tui: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1gLz8rJw4kLW9LxFhz2c_dQiIdVx5a2WHfnypA3DT4R9OM9-o1rh2_xLi1rW8h5BHCnfqBMlnvL-2UrHPOlKMPGHZZC2dPTPtaiqNdHF-i19oHGK7IyRqGEcQiAMrWi9xGLGwCJqE7YKlWfjG1OIQZV1bC-4dVkZ7IZd-UDJ7p-uEpmY2v1HWVTpLQ8yfyJHnxVYnnFJUAiEvIAT9GCFMBYVxD3POEQ1bj1U2NR5CXkBi-Fvt5M',
  chau: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGqG6f4P8p9DhGQaxhLEH4YaY-Mc8dHCXU1lPoI1_hR_s-VJz8iQ3vXs4c0HuN8w2wK18lHhiUwWHB80s5ysC_3WkTK-Hw5F_6s_lVGvZxLwx-3lqkVeHcaRJt8qUE5P1wVU3KqUn0FN5gqSPx5LiHBpfM2k5pZF1g_C6Z8kkPpIUMNv5wOqm9JO6CjGp9bC2-MgIqMmPpPZrJcFt8CaD1_sVGi9T3OxpfQtN7m2K3X22-M-MZco',
  ong_hut: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8deBNXkl2xkwwgcM6cQo2gv4T2yl4XNAoVmqBd5z5qm2iHSPvLUKnInRNPr8zcTJGC2FE4UNQBDyUHoaOD4oPekLAYHqtFD3y_sOhKzs6aUHcvpZaHq8WCFjzunK4L-6lzp6XnY3qjjfL1NVqWHMYRe_yqrIvF8zWW7NxFXfx2U7C0qzEXFBf71hbVXqd4MwmLwjbgLNwIcvEHINNPiPp7F3qDy7amZ-YGxIWdTPCf3l7ky7qMw',
  vong_tay: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQkJxjxVkZR08_5h4jN1fZGTKq7VmCKJYvnEefpXBJSJ-zxN2p8nxj5WYzNM2BvV_PkM2H21IjqMU9RORBOWfFG9wuPpCjD_3a1bJ7fL5fCfv8kH2UlBGNwdHqEXNYGPnP6FATfKSdL8VxMF2cFTfJEO9VcLDhQzpyDcqxJeKwJpuwlqCGf3cEBBuXoqfWR88xxB39TyK8dXh2m5X4P7RSMgOhJQzm9_cqVeHlFkxVTVnrp_6D8s',
  so_tay: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz_Z3C_aS8SYaelWTSxpzWJ2lrQZhL1pMRqy81UHXqfZuwA4WqhJqjGGg8RVdh1Q3OZO1S1fJj4fHkxPvvP2v3qdV9HaLpGR2MhHXPLDjwJPHr5PbnNHuv8FnJlSLSIw0vXnA23IIVvPKxnCgIuLcXkA77cqiX64P5ZMrKlPX1Lxjh2W4nSTYyWLQAm2RAlG7b2zMxW9RfkJJf-8CPNC92k0E-T3pchBvLaP9N9bnmWHBKjJqYFg',
  nen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo1Fk8Y3JjXIVxwEqnwrFdMNrBxz_FeR2T2VrDjycb7LdHn3gB9VpbJB4tH-sXJoVLFDXlVNQJPVrpzTe_VWExQ2LPdlMEfPBwfWOelA1a4dH6Vs3bVMzWp23V6eFi6kHZcSBp6LFTkxOMVnfK3r2XaJWQLBJhBOKl7rHzKxGxGCIj-eSN-FNDxq1T-bj0kQSfGaH6VL2Xk0OhSd18F5Mde8dGvmMNjsqxYYi3hPMkBPzLr9lhM',
  khan: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoMi3y8LH-3-z1VD9hTJoOOlUvNfLK3hPIrVCMRX2TcG7EPOjLDeBhCy2LZ5I3Fhgp5rjMcSiC6pKL2gJpylmS-2gvX2ggEr3xdFyh1uxVVQPDi8rDuOOY02wy-aCkF3fVMsz0a_MiipCNQFxR9c-8RA5bMvkbMz4fAv7VumHIx0ysYb3jRXFBOCB2fH-1x2qAq_zdfhJ2khdOG2vCxN8gCdIxm6LiPhLcyqB1pMz5nqnEy_0YE',
  tui_luoi: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNT_t2VW79Fhx7aLlIY_I-c5_bEi5hQBdg4WKlsJqYnR06RvvKIBT7gd2JsG32wUwHvPWfuGsq6h4aHnrH2dpjYCnbKn8S0mDcAZdMNaZxNqhKlkdlUB2zzPWuTVG5nP28KRfXkp9MuBFUQgKcwBZrJBWYCVOqkANF8S-ufSqPUcJpTAXr9HhAc93LPlCIE4U-uWr5a9x1ssjuVFNl93C_jXlj1sKxEfDGpX-dn6R_w9W52XHSg',
  thia: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjK2NUVjvlZNijrdZN2yxxLqwPAj3oeKqmGR7OBCMxJHUTD-0w4IZUShSb3Mfqt_cZBKOOxmQ9-lEOvp5u9gW4FLZqPf-j2F0z-p_8pBH4F3vS-RXXhMepbWlXxrRaQF2JrK5FKXwqB7WjfMEfuB3xGgXkrUFaJbBhWMivhG4hpnWlcLRj4fNEuJgX_D5VWIcVTqc_6FHePXNBqJGlDJn6fxKw5b1xzfqaK_EBHhCqQyXw_9pkE',
  thung_rac: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXIJ-XWiHDPPT7GzUXVCJwqvgX9acbLGVkXfuaHC7M_dVYNnpfNxSzNxfFNYkINJHflqSKT-CDUlF4p6WRKMcWfRNI0TtJyJIh_VhZLnluN3yEuxJR8Fp_7PY4swCmNYsqQ5z-f3dqzJHKPVSoKsv2vdI_4OMF6z97EIRGkKfuBPkgNHMY9z2HaOMOv-6AcwLcMeF6H6-DmGBdP2c9W5-dKkx2UZbm2cbAkTFUd1MYyQlY9tdjP4',
  den: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbYn71BwYpbJaxqX_E9SFk6Cp-ER3gWrZ2iyWaJ3eJdNT2b67VL8t3vO1lG_jEhYmNJo1pu9B-7-5UBHeBLh4s3ORaO5NU5CRb3R1vxfPOJEX5I9bSwG41oQhsQj4T1UNNmDUL51mYV3D--4R5t_3xnXtVLhKA2MqSTAK19Lrr7CqtbVhAT6rqBDNiA4qZXqIyS8kUgdCz3KqC68Z4qSdgc8b8C2qjuQcIjrr5t3JjrAFpvIvDsg',
  hero_collection: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBedrXkDwnbuXtA7NXRoNvwdmVLTEA92SaCQJcW2cZxNeQbVHxP1_eiUXtPdLJal30Gax8zhhNi9nq6H4yEOxy7nMFCZptAOzyZNlErSTJUduxy6fd6P7cTyf50T9GRjzVAFns2lHbH1Qc03z_-QnrWvzuUBlo_rZUIaHgwB8am3nBNUF2Fzi_nsuJpCXQSRqEDXhnJf1NWIvF5kWonuc-AXcRvricqDqDdpSqe8OGYU_h3liDXnVHl',
};

// ── Exchange Rates ──
export const EXCHANGE_RATES = [
  { id: 'clothing', name: 'Quần áo', rate: 60, unit: 'điểm/kg', icon: 'checkroom', desc: 'Áo sơ mi, jean, vải lụa sạch' },
  { id: 'shoes', name: 'Giày dép', rate: 80, unit: 'điểm/kg', icon: 'steps', desc: 'Giày thể thao, sandal, giày da' },
  { id: 'electronics', name: 'Đồ điện tử', rate: 400, unit: 'điểm/kg', icon: 'devices', desc: 'Linh kiện, điện thoại, máy tính' },
  { id: 'plastic', name: 'Nhựa & đồ gia dụng', rate: 30, unit: 'điểm/kg', icon: 'recycling', desc: 'Nhựa tái chế HDPE/PP, nồi niêu' },
];

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
    priceVND: 180000, priceOriginal: 240000, points: 450,
    image: STITCH_IMG.binh, rating: 4.9, reviews: 128,
    badge: 'sale', salePercent: 25, stock: 12,
    weeklyRedeemed: 128, isNew: false,
    desc: 'Bình giữ nhiệt Eco Bamboo 500ml, thép không gỉ 304, giữ nóng 12h / lạnh 24h.'
  },
  {
    id: 'p2', name: 'Túi vải canvas hữu cơ', category: 'Túi vải',
    priceVND: 120000, priceOriginal: null, points: 280,
    image: STITCH_IMG.tui, rating: 4.8, reviews: 96,
    badge: 'hot', stock: 34,
    weeklyRedeemed: 96, isNew: false,
    desc: 'Túi tote vải mộc Organic, thân thiện môi trường, sức chứa 15L.'
  },
  {
    id: 'p3', name: 'Chậu cây tái chế', category: 'Cây xanh',
    priceVND: 160000, priceOriginal: 195000, points: 350,
    image: STITCH_IMG.chau, rating: 5.0, reviews: 42,
    badge: 'hot', stock: 8,
    weeklyRedeemed: 42, isNew: false,
    desc: 'Bộ chậu sen đá đất nung mini, dành riêng cho thành viên xanh.'
  },
  {
    id: 'p4', name: 'Ống hút inox bộ 4', category: 'Đồ gia dụng',
    priceVND: 65000, priceOriginal: null, points: 150,
    image: STITCH_IMG.ong_hut, rating: 4.7, reviews: 35,
    badge: 'new', stock: 50,
    weeklyRedeemed: 35, isNew: true,
    desc: 'Bộ 4 ống hút inox kèm cọ rửa, túi đựng vải canvas.'
  },
  {
    id: 'p5', name: 'Vòng tay handmade tái chế', category: 'Túi vải',
    priceVND: 45000, priceOriginal: null, points: 100,
    image: STITCH_IMG.vong_tay, rating: 4.6, reviews: 21,
    badge: null, stock: 28,
    weeklyRedeemed: 21, isNew: false,
    desc: 'Vòng tay thủ công từ nhựa tái chế, mỗi chiếc là duy nhất.'
  },
  {
    id: 'p6', name: 'Sổ tay giấy tái chế', category: 'Đồ gia dụng',
    priceVND: 55000, priceOriginal: 65000, points: 130,
    image: STITCH_IMG.so_tay, rating: 4.9, reviews: 74,
    badge: 'sale', salePercent: 15, stock: 45,
    weeklyRedeemed: 74, isNew: false,
    desc: 'Sổ tay Ví Xanh, giấy tái chế 100%, bìa kraft thân thiện.'
  },
  {
    id: 'p7', name: 'Nến sáp ong thủ công', category: 'Đồ gia dụng',
    priceVND: 145000, priceOriginal: null, points: 320,
    image: STITCH_IMG.nen, rating: 4.8, reviews: 53,
    badge: 'hot', stock: 15,
    weeklyRedeemed: 53, isNew: false,
    desc: 'Nến sáp ong nguyên chất, hương oải hương tự nhiên, cháy 40h.'
  },
  {
    id: 'p8', name: 'Khăn tre kháng khuẩn', category: 'Túi vải',
    priceVND: 85000, priceOriginal: null, points: 190,
    image: STITCH_IMG.khan, rating: 4.7, reviews: 19,
    badge: 'new', stock: 60,
    weeklyRedeemed: 19, isNew: true,
    desc: 'Khăn mặt sợi tre tự nhiên, kháng khuẩn, siêu thấm hút.'
  },
  {
    id: 'p9', name: 'Túi lưới đi chợ bộ 3', category: 'Túi vải',
    priceVND: 95000, priceOriginal: null, points: 210,
    image: STITCH_IMG.tui_luoi, rating: 4.8, reviews: 68,
    badge: null, stock: 38,
    weeklyRedeemed: 68, isNew: false,
    desc: 'Bộ 3 túi lưới cotton đi chợ, thay thế hoàn toàn túi nilon.'
  },
  {
    id: 'p10', name: 'Bộ thìa đĩa gỗ dừa Bến Tre', category: 'Đồ gia dụng',
    priceVND: 75000, priceOriginal: 90000, points: 150,
    image: STITCH_IMG.thia, rating: 4.9, reviews: 41,
    badge: 'new', stock: 22,
    weeklyRedeemed: 41, isNew: false,
    desc: 'Thìa đĩa gỗ dừa thủ công Bến Tre, an toàn thực phẩm.'
  },
  {
    id: 'p11', name: 'Thùng phân loại rác gia đình', category: 'Đồ gia dụng',
    priceVND: 490000, priceOriginal: 550000, points: 1200,
    image: STITCH_IMG.thung_rac, rating: 4.5, reviews: 12,
    badge: 'sale', salePercent: 10, stock: 5,
    weeklyRedeemed: 12, isNew: false,
    desc: 'Thùng phân loại rác 3 ngăn, nhựa tái chế, có nhãn phân loại.'
  },
  {
    id: 'p12', name: 'Đèn bàn năng lượng mặt trời', category: 'Đồ gia dụng',
    priceVND: 850000, priceOriginal: 950000, points: 2100,
    image: STITCH_IMG.den, rating: 4.6, reviews: 8,
    badge: null, stock: 3,
    weeklyRedeemed: 8, isNew: false,
    desc: 'Đèn bàn LED sạc bằng năng lượng mặt trời, 3 chế độ sáng.'
  },
];

// ── Initial Transactions ──
export const INITIAL_TRANSACTIONS = [
  { id: 't1', type: 'trade-in', desc: 'Đổi 2kg quần áo cũ – Điểm thu gom Cầu Giấy', points: 120, date: '2026-09-24T14:30:00', category: 'clothing', weight: 2 },
  { id: 't2', type: 'redeem', desc: 'Đổi Bình giữ nhiệt tái chế 500ml – Đơn hàng #VX-8921', points: -450, date: '2026-09-20T09:15:00', orderId: 'VX-8921', productId: 'p1' },
  { id: 't3', type: 'trade-in', desc: 'Đổi 1.5kg đồ điện tử cũ – Điểm thu gom Hoàn Kiếm', points: 600, date: '2026-09-15T16:00:00', category: 'electronics', weight: 1.5 },
  { id: 't4', type: 'bonus', desc: 'Thưởng phân loại rác tuần xanh – Chương trình hành động', points: 50, date: '2026-09-10T10:00:00' },
  { id: 't5', type: 'redeem', desc: 'Đổi Túi vải canvas Eco-Life – Đơn hàng #VX-8710', points: -280, date: '2026-09-02T11:20:00', orderId: 'VX-8710', productId: 'p2' },
  { id: 't6', type: 'trade-in', desc: 'Đổi 3kg nhựa gia dụng – Điểm thu gom Q1', points: 90, date: '2026-08-28T15:45:00', category: 'plastic', weight: 3 },
  { id: 't7', type: 'bonus', desc: 'Hoàn thành thử thách 7 ngày xanh', points: 100, date: '2026-08-22T09:00:00' },
  { id: 't8', type: 'trade-in', desc: 'Đổi 5kg quần áo cũ – Điểm thu gom Cầu Giấy', points: 300, date: '2026-08-15T13:20:00', category: 'clothing', weight: 5 },
  { id: 't9', type: 'redeem', desc: 'Đổi Sổ tay giấy tái chế – Đơn hàng #VX-8650', points: -130, date: '2026-08-10T17:30:00', orderId: 'VX-8650', productId: 'p6' },
  { id: 't10', type: 'trade-in', desc: 'Đổi 2kg giày dép cũ – Điểm thu gom Hoàn Kiếm', points: 160, date: '2026-08-05T10:10:00', category: 'shoes', weight: 2 },
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
  monthlyPoints: [280, 450, 320, 380, 520, 610],  // last 6 months
  quarterGoal: 78,  // percent
};

// ── Vouchers ──
export const VOUCHERS = [
  { id: 'v1', title: 'Giảm 20% đơn hàng tiếp theo', code: 'GREEN20', expiresAt: '2026-12-31', minPoints: 500 },
  { id: 'v2', title: 'Miễn phí vận chuyển', code: 'FREESHIP', expiresAt: '2026-10-31', minPoints: 200 },
  { id: 'v3', title: 'Đổi thêm 50 điểm bonus', code: 'BONUS50', expiresAt: '2026-11-15', minPoints: 100 },
];

// ── Milestones ──
export const MILESTONES = [
  { id: 'm1', title: 'Người mới bắt đầu', desc: 'Đổi đồ cũ lần đầu tiên', achieved: true, icon: 'eco' },
  { id: 'm2', title: 'Nhà tái chế', desc: 'Đổi tổng cộng 10kg đồ cũ', achieved: true, icon: 'recycling' },
  { id: 'm3', title: 'Chiến binh xanh', desc: 'Đổi tổng cộng 50kg đồ cũ', achieved: false, icon: 'military_tech' },
  { id: 'm4', title: 'Hội viên Bạc', desc: 'Tích lũy 3.000 điểm xanh', achieved: true, icon: 'workspace_premium' },
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
