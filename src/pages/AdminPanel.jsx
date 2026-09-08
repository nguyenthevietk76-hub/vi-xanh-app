import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import {
  collection, onSnapshot, doc, updateDoc, orderBy, query,
  getCountFromServer, getAggregateFromServer, sum, where, getDocs, limit,
  addDoc, serverTimestamp
} from 'firebase/firestore';

export default function AdminPanel() {
  const [brands, setBrands] = useState([]);

  // P1-2: Thống kê tổng quan
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeBrands: 0,
    topProducts: [],
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'brands'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const brandsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBrands(brandsData);
      // Đếm brand đang hoạt động từ data đã có (tránh query thêm)
      setStats(prev => ({ ...prev, activeBrands: brandsData.filter(b => b.status === 'approved').length }));
    });
    return unsub;
  }, []);

  // P1-2: Load thống kê đơn hàng (chạy 1 lần khi mount)
  useEffect(() => {
    async function loadStats() {
      try {
        // Tổng số đơn hàng
        const ordersCol = collection(db, 'orders');
        const countSnap = await getCountFromServer(ordersCol);
        const totalOrders = countSnap.data().count;

        // Tổng doanh thu VNĐ (chỉ đơn mua, không tính đổi điểm)
        const buyOrdersQuery = query(ordersCol, where('type', '==', 'buy'));
        const aggSnap = await getAggregateFromServer(buyOrdersQuery, {
          totalRevenue: sum('totalVND'),
        });
        const totalRevenue = aggSnap.data().totalRevenue || 0;

        // Top 5 sản phẩm bán chạy
        const topQuery = query(collection(db, 'products'), orderBy('weeklyRedeemed', 'desc'), limit(5));
        const topSnap = await getDocs(topQuery);
        const topProducts = topSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats(prev => ({ ...prev, totalOrders, totalRevenue, topProducts }));
        setStatsLoaded(true);
      } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
        setStatsLoaded(true);
      }
    }
    loadStats();
  }, []);

  const setStatus = async (brandId, status) => {
    await updateDoc(doc(db, 'brands', brandId), { status });
    // P1-3: Gửi thông báo đến tài khoản Brand
    try {
      await addDoc(collection(db, 'notifications', brandId, 'items'), {
        type: 'brand_approval',
        title: status === 'approved' ? 'Hồ sơ Brand đã được duyệt! 🎉' : 'Hồ sơ Brand bị từ chối',
        message: status === 'approved'
          ? 'Chúc mừng! Hồ sơ Brand của bạn đã được duyệt. Bạn có thể bắt đầu đăng bán sản phẩm.'
          : 'Hồ sơ Brand của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin đăng ký.',
        link: status === 'approved' ? '/brand/dashboard' : '/brand/dang-ky',
        readAt: null,
        createdAt: serverTimestamp(),
      });
    } catch (errNotif) {
      console.warn('Không thể gửi thông báo cho brand:', errNotif);
    }
  };

  const pending = brands.filter(b => b.status === 'pending');
  const others = brands.filter(b => b.status !== 'pending');

  return (
    <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet py-space-2xl">
      <h2 className="text-title-lg font-bold mb-space-xl">Quản trị hệ thống Ví Xanh</h2>

      {/* P1-2: Tổng quan hệ thống */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-2xl">
        {[
          { label: 'Tổng đơn hàng', value: stats.totalOrders.toLocaleString('vi-VN'), icon: 'receipt_long' },
          { label: 'Doanh thu (VNĐ)', value: stats.totalRevenue.toLocaleString('vi-VN') + 'đ', icon: 'payments' },
          { label: 'Brand hoạt động', value: stats.activeBrands, icon: 'storefront' },
          { label: 'Sản phẩm top', value: stats.topProducts.length, icon: 'trending_up' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest rounded-card p-space-xl shadow-subtle text-center">
            <span className="material-symbols-outlined text-[28px] text-secondary mb-space-sm block">{s.icon}</span>
            <div className="text-headline-sm text-primary font-bold">{statsLoaded ? s.value : '...'}</div>
            <div className="text-label-sm text-on-surface-variant mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* P1-2: Top 5 sản phẩm bán chạy */}
      {stats.topProducts.length > 0 && (
        <div className="mb-space-2xl">
          <h3 className="text-title-md font-semibold mb-space-md">Top sản phẩm bán chạy</h3>
          <div className="space-y-space-xs">
            {stats.topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-space-md bg-surface-container-lowest rounded-card p-space-md shadow-subtle">
                <span className="text-title-lg font-bold text-primary w-8 text-center shrink-0">#{idx + 1}</span>
                {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-nested shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-label-lg font-semibold truncate">{p.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{p.brandName} · {p.weeklyRedeemed} lượt giao dịch</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duyệt Brand */}
      <h3 className="text-title-md font-semibold mb-space-md">Đang chờ duyệt ({pending.length})</h3>
      <div className="space-y-space-sm mb-space-2xl">
        {pending.length === 0 && <p className="text-body-md text-on-surface-variant">Không có hồ sơ nào đang chờ.</p>}
        {pending.map(b => (
          <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest rounded-card p-space-md shadow-subtle">
            <div>
              <p className="text-label-lg font-semibold">{b.brandName}</p>
              <p className="text-label-sm text-on-surface-variant">{b.ownerEmail}</p>
              {b.description && <p className="text-body-sm text-on-surface-variant mt-1">{b.description}</p>}
            </div>
            <div className="flex gap-space-xs shrink-0">
              <button onClick={() => setStatus(b.id, 'approved')} className="px-space-md py-space-xs bg-primary text-on-primary rounded-input text-label-md font-semibold">Duyệt</button>
              <button onClick={() => setStatus(b.id, 'rejected')} className="px-space-md py-space-xs bg-surface-container-high text-red-600 rounded-input text-label-md font-semibold">Từ chối</button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-title-md font-semibold mb-space-md">Đã xử lý</h3>
      <div className="space-y-space-sm">
        {others.map(b => (
          <div key={b.id} className="flex items-center justify-between gap-space-md bg-surface-container-lowest rounded-card p-space-md">
            <div>
              <p className="text-label-lg font-semibold">{b.brandName}</p>
              <p className="text-label-sm text-on-surface-variant">{b.ownerEmail}</p>
            </div>
            <span className={`text-label-sm font-semibold ${b.status === 'approved' ? 'text-primary' : 'text-red-600'}`}>
              {b.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
