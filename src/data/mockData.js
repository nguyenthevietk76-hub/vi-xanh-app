/* ══════════════════════════════════════════
   MOCK DATA — Ví Xanh
   Products, Transactions, Impact, Exchange Rates
   ══════════════════════════════════════════ */

// ── Ảnh sản phẩm trưng bày ──
// Ảnh minh hoạ từ Pexels (giấy phép Pexels, dùng miễn phí) — thay bằng ảnh chụp sản phẩm thật khi có.
const img = (name) => `/images/shop/${name}.jpg`;



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
// Sản phẩm trưng bày (demo) của Ví Xanh — toàn bộ là đồ thủ công.
//  - 20 sản phẩm bán: trả bằng VNĐ; điểm xanh chỉ là mã giảm giá (tối đa 50% đơn, không quá 200 điểm).
//  - 5 quà độc quyền (redeemOnly: true): tác phẩm thủ công có giá trị nghệ thuật, KHÔNG bán,
//    chỉ đổi trọn bằng điểm xanh (giá = points), số lượng rất ít.
// Chưa có đánh giá/lượt bán thật nên để rating: null, reviews: 0, weeklyRedeemed: 0.
const base = { rating: null, reviews: 0, weeklyRedeemed: 0, brandName: 'Ví Xanh' };
const exclusive = (o) => ({ ...base, category: 'Độc quyền đổi điểm', redeemOnly: true, badge: 'exclusive', isNew: true, ...o });
const sale = (o) => ({ ...base, badge: null, isNew: false, ...o });

export const PRODUCTS = [
  // ── Quà độc quyền đổi điểm (tác phẩm nghệ thuật thủ công) ──
  exclusive({
    id: 'x1', name: 'Bình gốm vẽ tay “Chim và hoa”', points: 600, stock: 5, image: img('x-binh-gom-ve-tay'),
    desc: 'Bình gốm nung đỏ, vẽ tay từng nét hình chim và hoa bằng màu gốm. Mỗi chiếc được vẽ riêng nên không có hai chiếc giống nhau. Chỉ đổi bằng điểm xanh, không bán.',
  }),
  exclusive({
    id: 'x2', name: 'Tranh ghép vải vụn “Rừng xanh”', points: 900, stock: 3, image: img('x-tranh-ghep-vai'),
    desc: 'Tranh treo tường khâu tay từ hàng trăm mảnh vải vụn nhiều sắc xanh, lấy cảm hứng từ chính quần áo cũ được gửi về Ví Xanh. Kích thước lớn, kèm thanh treo. Chỉ đổi bằng điểm xanh, không bán.',
  }),
  exclusive({
    id: 'x3', name: 'Tượng thủy tinh thổi “Giọt lửa”', points: 1000, stock: 3, image: img('x-tuong-thuy-tinh-thoi'),
    desc: 'Tượng thủy tinh thổi thủ công hình giọt nước, vân đỏ trắng xoắn bên trong. Mỗi tác phẩm là bản duy nhất. Chỉ đổi bằng điểm xanh, không bán.',
  }),
  exclusive({
    id: 'x4', name: 'Tranh kính màu “Hoa anh túc”', points: 1200, stock: 2, image: img('x-tranh-kinh-mau'),
    desc: 'Tranh kính màu ghép chì thủ công, cắt và hàn từng mảnh kính. Đặt cạnh cửa sổ để ánh sáng xuyên qua. Chỉ đổi bằng điểm xanh, không bán.',
  }),
  exclusive({
    id: 'x5', name: 'Tranh khảm thủy tinh tái chế “Vườn hoa”', points: 1500, stock: 2, image: img('x-tranh-kham-thuy-tinh'),
    desc: 'Tranh khảm (mosaic) ghép tay từ các mảnh thủy tinh và gốm vỡ tái chế, màu ánh kim đổi sắc theo ánh sáng. Tác phẩm đặc biệt nhất, số lượng rất ít. Chỉ đổi bằng điểm xanh, không bán.',
  }),

  // ── Sản phẩm bán (dùng điểm để giảm giá) ──
  // Túi & phụ kiện
  sale({ id: 'p1', name: 'Túi tote vải canvas', category: 'Túi & phụ kiện', priceVND: 119000, stock: 40, image: img('tui-tote-canvas'),
    desc: 'Túi tote vải canvas dày, may tay đường chỉ chắc, dùng đi học, đi chợ thay túi ni-lông.' }),
  sale({ id: 'p2', name: 'Túi tote từ quần jean cũ', category: 'Túi & phụ kiện', priceVND: 189000, stock: 15, isNew: true, image: img('tui-denim-tai-che'),
    desc: 'Túi tote may lại từ quần jean cũ, giữ nguyên túi sau làm ngăn nhỏ. Mỗi chiếc có màu jean khác nhau.' }),
  sale({ id: 'p3', name: 'Túi lưới móc đi chợ', category: 'Túi & phụ kiện', priceVND: 139000, stock: 25, image: img('tui-luoi-moc'),
    desc: 'Túi lưới móc tay bằng sợi cotton, co giãn, đựng rau củ quả đi chợ, gấp gọn khi không dùng.' }),
  sale({ id: 'p4', name: 'Túi xách móc len họa tiết ô vuông', category: 'Túi & phụ kiện', priceVND: 459000, stock: 6, isNew: true, image: img('tui-xach-moc-len'),
    desc: 'Túi xách móc len họa tiết ô vuông nhiều màu, lót vải hoa, khóa kim loại và quai da. Móc tay hoàn toàn.' }),
  sale({ id: 'p5', name: 'Túi rút vải vụn (bộ 2)', category: 'Túi & phụ kiện', priceVND: 69000, stock: 50, image: img('tui-rut-vai-vun'),
    desc: 'Bộ 2 túi dây rút may từ vải thừa, dùng đựng đồ lặt vặt, mỹ phẩm hoặc gói quà thay giấy.' }),
  // Đồ len đan tay
  sale({ id: 'p6', name: 'Khăn len đan tay có tua', category: 'Đồ len đan tay', priceVND: 289000, stock: 10, image: img('khan-len-dan-tay'),
    desc: 'Khăn quàng đan tay sọc nhiều màu, hai đầu có tua. Mềm, ấm, dùng được nhiều mùa.' }),
  sale({ id: 'p7', name: 'Mũ len đan tay', category: 'Đồ len đan tay', priceVND: 179000, stock: 12, image: img('mu-len-dan-tay'),
    desc: 'Mũ len đan tay kiểu beanie, vành bo gân, co giãn vừa nhiều cỡ đầu.' }),
  // Trang trí nhà
  sale({ id: 'p8', name: 'Giỏ cói đan tay hai màu', category: 'Trang trí nhà', priceVND: 259000, stock: 10, image: img('gio-coi-dan-tay'),
    desc: 'Giỏ cói đan tay phối trắng và nâu, quai tết, dùng đựng chăn, đồ chơi hoặc làm vỏ chậu cây.' }),
  sale({ id: 'p9', name: 'Dây treo chậu cây macrame', category: 'Trang trí nhà', priceVND: 149000, stock: 20, image: img('macrame-treo-cay'),
    desc: 'Dây treo chậu cây thắt macrame bằng sợi cotton, kèm hạt gỗ. Chưa gồm chậu và cây.' }),
  sale({ id: 'p10', name: 'Tranh thêu tay khung tròn “Hoa cúc”', category: 'Trang trí nhà', priceVND: 329000, stock: 8, isNew: true, image: img('tranh-theu-tay'),
    desc: 'Tranh thêu tay hoa cúc trên vải lanh, căng trong khung gỗ tròn, treo tường hoặc đặt bàn.' }),
  // Gốm & bếp
  sale({ id: 'p11', name: 'Cốc gốm men xanh kèm đĩa', category: 'Gốm & bếp', priceVND: 219000, stock: 12, image: img('coc-gom-thu-cong'),
    desc: 'Cốc gốm nặn tay, men xanh rêu, vẽ họa tiết chim, kèm đĩa lót. Mỗi chiếc men loang khác nhau.' }),
  sale({ id: 'p12', name: 'Bộ 2 bát gốm men lam', category: 'Gốm & bếp', priceVND: 249000, stock: 10, image: img('bat-gom-thu-cong'),
    desc: 'Bộ 2 bát gốm xoay tay, men lam ngọc, viền để mộc. Dùng đựng đồ ăn khô hoặc trang trí.' }),
  sale({ id: 'p13', name: 'Bộ thìa gỗ thủ công', category: 'Gốm & bếp', priceVND: 99000, stock: 25, image: img('dung-cu-bep-go'),
    desc: 'Bộ thìa gỗ nhiều cỡ đẽo tay, buộc dây vải, thay thìa nhựa dùng một lần.' }),
  // Nến & chăm sóc
  sale({ id: 'p14', name: 'Nến thơm sáp đậu nành bấc gỗ', category: 'Nến & chăm sóc', priceVND: 129000, stock: 30, image: img('nen-sap-dau-nanh'),
    desc: 'Nến sáp đậu nành đổ tay trong hũ thủy tinh, bấc gỗ cháy lách tách. Hũ dùng lại được.' }),
  sale({ id: 'p15', name: 'Nến sáp ong cuộn tay (bộ 3)', category: 'Nến & chăm sóc', priceVND: 99000, stock: 20, image: img('nen-sap-ong'),
    desc: 'Bộ 3 nến cuộn tay từ tấm sáp ong vân tổ ong, mùi mật ong nhẹ tự nhiên.' }),
  sale({ id: 'p16', name: 'Xà phòng bã cà phê', category: 'Nến & chăm sóc', priceVND: 59000, stock: 40, isNew: true, image: img('xa-phong-ba-ca-phe'),
    desc: 'Xà phòng thủ công phối bã cà phê đã sấy khô, giúp làm sạch và khử mùi tay.' }),
  sale({ id: 'p17', name: 'Tẩy tế bào chết bã cà phê', category: 'Nến & chăm sóc', priceVND: 89000, stock: 30, isNew: true, image: img('tay-te-bao-chet-ca-phe'),
    desc: 'Hỗn hợp tẩy tế bào chết từ bã cà phê sấy khô và dầu dưỡng, dùng cho da toàn thân.' }),
  // Đồ dùng xanh
  sale({ id: 'p18', name: 'Ống hút tre kèm cọ rửa', category: 'Đồ dùng xanh', priceVND: 49000, stock: 60, image: img('ong-hut-tre'),
    desc: 'Ống hút làm từ thân tre tự nhiên, kèm cọ rửa. Dùng lại nhiều lần thay ống hút nhựa.' }),
  sale({ id: 'p19', name: 'Bàn chải tre', category: 'Đồ dùng xanh', priceVND: 39000, stock: 60, image: img('ban-chai-tre'),
    desc: 'Bàn chải cán tre, lông than hoạt tính. Cán tre phân hủy được, thay cho cán nhựa.' }),
  sale({ id: 'p20', name: 'Sổ tay bìa vải thêu', category: 'Đồ dùng xanh', priceVND: 159000, stock: 15, image: img('so-tay-handmade'),
    desc: 'Sổ tay đóng gáy thủ công, bìa bọc vải hoa có miếng thêu chim, buộc dây gai.' }),
];

// ── Initial Transactions ──
export const INITIAL_TRANSACTIONS = [
  { id: 't1', type: 'trade-in', desc: 'Đổi 2kg quần áo loại A – Điểm thu gom Cầu Giấy', points: 30, date: '2026-09-24T14:30:00', category: 'clothes_a', weight: 2 },
  { id: 't2', type: 'discount', desc: 'Dùng 94 điểm giảm giá – Túi tote từ quần jean cũ – Đơn hàng #VX-8921', points: -94, date: '2026-09-20T09:15:00', orderId: 'VX-8921', productId: 'p2' },
  { id: 't3', type: 'trade-in', desc: 'Đổi 5kg bã cà phê – Điểm thu gom Hoàn Kiếm', points: 10, date: '2026-09-15T16:00:00', category: 'coffee', weight: 5 },
  { id: 't4', type: 'bonus', desc: 'Thưởng phân loại rác tuần xanh – Chương trình hành động', points: 5, date: '2026-09-10T10:00:00' },
  { id: 't5', type: 'discount', desc: 'Dùng 64 điểm giảm giá – Cốc gốm men xanh kèm đĩa – Đơn hàng #VX-8710', points: -64, date: '2026-09-02T11:20:00', orderId: 'VX-8710', productId: 'p11' },
  { id: 't6', type: 'trade-in', desc: 'Đổi 4kg quần áo loại B – Điểm thu gom Q1', points: 32, date: '2026-08-28T15:45:00', category: 'clothes_b', weight: 4 },
  { id: 't7', type: 'bonus', desc: 'Hoàn thành thử thách 7 ngày xanh', points: 10, date: '2026-08-22T09:00:00' },
  { id: 't8', type: 'trade-in', desc: 'Đổi 5kg quần áo loại C – Điểm thu gom Cầu Giấy', points: 15, date: '2026-08-15T13:20:00', category: 'clothes_c', weight: 5 },
  { id: 't9', type: 'discount', desc: 'Dùng 29 điểm giảm giá – Xà phòng bã cà phê – Đơn hàng #VX-8650', points: -29, date: '2026-08-10T17:30:00', orderId: 'VX-8650', productId: 'p16' },
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
    // Số liệu công khai của dự án nằm ở src/data/projectInfo.js
    title: 'Cho quần áo cũ và bã cà phê một vòng đời mới',
    subtitle: 'Dự án khởi nghiệp sinh viên · Thí điểm 2026',
    goal: 1000, // kg — mục tiêu đợt thí điểm
    current: null, // chưa có số liệu kiểm chứng
    partners: [],
  },
];

// ── Categories for filters ──
const CATEGORY_NAMES = ['Túi & phụ kiện', 'Đồ len đan tay', 'Trang trí nhà', 'Gốm & bếp', 'Nến & chăm sóc', 'Đồ dùng xanh', 'Độc quyền đổi điểm'];
export const CATEGORIES = [
  { id: 'all', name: 'Tất cả', count: PRODUCTS.length },
  ...CATEGORY_NAMES.map(name => ({ id: name, name, count: PRODUCTS.filter(p => p.category === name).length })),
];

export const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'redeem', label: 'Độc quyền đổi điểm' },
  { id: 'buy', label: 'Mua (dùng điểm giảm giá)' },
  { id: 'new', label: 'Hàng mới về' },
];
