import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db } from '../lib/firebase';
import BrandOverview from '../components/brand/BrandOverview';
import BrandProducts from '../components/brand/BrandProducts';
import BrandOrders from '../components/brand/BrandOrders';

// Mỗi brand chỉ tải dữ liệu của chính mình → trang nhẹ dù có nhiều brand trên sàn
const ORDERS_LIMIT = 500;

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: 'monitoring' },
  { id: 'products', label: 'Sản phẩm', icon: 'inventory_2' },
  { id: 'orders', label: 'Đơn hàng', icon: 'receipt_long' },
];

export default function BrandDashboard() {
  const { user, brand } = useAuth();
  const { confirmOrderPayment, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some(t => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const [orderFilter, setOrderFilter] = useState('all');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState({ products: true, orders: true });
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'products'), where('brandId', '==', user.uid));
    return onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(l => ({ ...l, products: false }));
    }, (err) => {
      console.error('Lỗi tải sản phẩm:', err);
      setLoadError('Không tải được sản phẩm. Kiểm tra kết nối hoặc quyền truy cập.');
      setLoading(l => ({ ...l, products: false }));
    });
  }, [user]);

  // Đơn hàng: ưu tiên truy vấn có sắp xếp (cần composite index brandId + createdAt).
  // Nếu Firestore chưa có index → tự chuyển sang truy vấn không sắp xếp và sắp xếp phía máy.
  useEffect(() => {
    if (!user) return;
    const col = collection(db, 'orders');
    let unsub = () => {};
    const handle = (sortClient) => (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (sortClient) list.sort((a, b) => (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity));
      setOrders(list);
      setLoading(l => ({ ...l, orders: false }));
    };
    const onError = (err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Thiếu index orders(brandId, createdAt) — dùng truy vấn dự phòng. Tạo index theo link:', err.message);
        unsub = onSnapshot(query(col, where('brandId', '==', user.uid), limit(ORDERS_LIMIT)), handle(true), (e2) => {
          console.error('Lỗi tải đơn hàng:', e2);
          setLoadError('Không tải được đơn hàng.');
          setLoading(l => ({ ...l, orders: false }));
        });
      } else {
        console.error('Lỗi tải đơn hàng:', err);
        setLoadError('Không tải được đơn hàng. Kiểm tra kết nối hoặc quyền truy cập.');
        setLoading(l => ({ ...l, orders: false }));
      }
    };
    unsub = onSnapshot(query(col, where('brandId', '==', user.uid), orderBy('createdAt', 'desc'), limit(ORDERS_LIMIT)), handle(false), onError);
    return () => unsub();
  }, [user]);

  const goTo = (nextTab, filter) => {
    if (filter) setOrderFilter(filter);
    setSearchParams(nextTab === 'overview' ? {} : { tab: nextTab }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const isLoading = loading.products || loading.orders;

  return (
    <div className="max-w-content mx-auto w-full px-4 md:px-margin-tablet py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-eco-tint text-leaf-green flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[26px]">storefront</span>
        </div>
        <div className="min-w-0">
          <p className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Bảng điều khiển Brand</p>
          <h1 className="text-title-lg sm:text-headline-sm font-bold truncate">{brand?.brandName || 'Brand của bạn'}</h1>
        </div>
      </div>

      {/* Tabs — cố định dưới thanh điều hướng khi cuộn */}
      <div className="sticky top-20 z-20 -mx-4 px-4 md:mx-0 md:px-0 py-2 mb-5 bg-surface-container-high/95 backdrop-blur-md">
        <div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-subtle max-w-xl">
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => goTo(t.id)}
                className={`relative h-10 sm:h-11 rounded-full flex items-center justify-center gap-1.5 text-label-md sm:text-label-lg font-semibold transition-colors ${
                  active ? 'bg-primary text-on-primary shadow-subtle' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{t.icon}</span>
                {t.label}
                {t.id === 'orders' && pendingCount > 0 && (
                  <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${active ? 'bg-on-primary text-primary' : 'bg-sunlit-ochre text-sunlit-ochre-text'}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loadError && (
        <p role="alert" className="mb-4 flex gap-1.5 text-label-md bg-coral-mist text-coral-mist-text rounded-lg p-3">
          <span className="material-symbols-outlined text-[18px]">error</span>{loadError}
        </p>
      )}

      {isLoading && tab === 'overview' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-busy="true">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-24 rounded-card bg-surface-container-lowest animate-pulse" />)}
        </div>
      ) : tab === 'overview' ? (
        <BrandOverview orders={orders} products={products} ordersLimited={orders.length >= ORDERS_LIMIT} onGoTo={goTo} />
      ) : tab === 'products' ? (
        <BrandProducts products={products} user={user} brand={brand} showToast={showToast} />
      ) : (
        <BrandOrders orders={orders} user={user} showToast={showToast} confirmOrderPayment={confirmOrderPayment} initialFilter={orderFilter} />
      )}
    </div>
  );
}
