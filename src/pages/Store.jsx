import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, FILTER_TABS } from '../data/mockData';
import { WalletBadge } from '../components/WalletPointCounter';
import ProductCard from '../components/ProductCard';
import Chip from '../components/Chip';
import ScrollReveal from '../components/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Store() {
  const { products, wallet, cart, openPurchaseModal } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filtered = useMemo(() => {
    let result = [...products];

    // Tab filter
    if (activeTab === 'sale') result = result.filter(p => p.badge === 'sale' || p.priceOriginal);
    else if (activeTab === 'points-only') result = result.filter(p => p.points <= 350 || p.badge === 'points-only');
    else if (activeTab === 'new') result = result.filter(p => p.isNew);
    else if (activeTab === 'combo') result = result.filter(p => p.category === 'Đồ gia dụng' || p.badge === 'hot');

    // Category filter
    if (selectedCategory !== 'all') result = result.filter(p => p.category === selectedCategory);

    // Sort
    if (sortBy === 'price-low') result.sort((a, b) => (a.priceVND || 0) - (b.priceVND || 0));
    else if (sortBy === 'price-high') result.sort((a, b) => (b.priceVND || 0) - (a.priceVND || 0));
    else result.sort((a, b) => b.weeklyRedeemed - a.weeklyRedeemed);

    return result;
  }, [products, activeTab, selectedCategory, sortBy]);

  // Countdown timer for flash sale
  const [countdown] = useState({ h: 2, m: 14, s: 40 });

  return (
    <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-2xl">
      {/* Breadcrumb + Wallet */}
      <div className="flex items-center justify-between mb-space-xl">
        <div className="flex items-center gap-space-xs text-body-md text-on-surface-variant">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Trang chủ</button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Cửa hàng</span>
        </div>
        <div className="hidden sm:block">
          <WalletBadge onClick={() => navigate('/vi-cua-toi')} />
        </div>
      </div>

      {/* Flash Sale Banner */}
      <ScrollReveal preset="fade-up">
        <div className="bg-gradient-to-r from-primary to-tertiary-container rounded-hero p-space-xl md:p-space-2xl flex flex-col md:flex-row items-center justify-between gap-space-md mb-space-xl text-on-primary">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[28px] text-secondary-fixed">bolt</span>
            <div>
              <h3 className="text-title-lg font-bold">Flash sale xanh — giảm đến 30%</h3>
              <p className="text-body-sm text-[#DCEEDF]/80">Số lượng có hạn, làm mới không gian sống bền vững</p>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1">
              {[countdown.h, countdown.m, countdown.s].map((v, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-white/20 backdrop-blur-sm rounded-nested px-2.5 py-1 text-title-md font-bold">{String(v).padStart(2, '0')}</span>
                  {i < 2 && <span className="text-title-md font-bold">:</span>}
                </span>
              ))}
            </div>
            <button className="text-label-lg font-semibold text-secondary-fixed hover:text-on-primary transition-colors flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined icon-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Trust Bar */}
      <div className="flex flex-wrap items-center justify-center gap-space-xl mb-space-xl text-body-md text-on-surface-variant bg-surface-container-lowest rounded-card p-space-md shadow-subtle">
        {[
          { icon: 'local_shipping', text: 'Miễn phí vận chuyển từ 300.000đ' },
          { icon: 'autorenew', text: 'Đổi trả trong 7 ngày' },
          { icon: 'verified_user', text: 'Thanh toán an toàn & Bảo vệ người mua' },
        ].map(item => (
          <div key={item.text} className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined icon-md text-secondary">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-space-xs mb-space-xl">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-space-lg py-space-xs rounded-chip text-label-lg font-semibold transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-space-xl">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-[220px] shrink-0 space-y-space-xl">
          {/* Categories */}
          <div className="bg-surface-container-lowest rounded-card p-space-xl shadow-subtle">
            <h4 className="text-title-md font-semibold mb-space-md">Danh mục</h4>
            {CATEGORIES.map(cat => (
              <label key={cat.id} className="flex items-center gap-space-sm py-space-xs cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategory === cat.id}
                  onChange={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                  className="w-5 h-5 rounded-[6px] border-2 border-outline-variant accent-primary cursor-pointer"
                />
                <span className="text-body-md text-on-surface group-hover:text-primary transition-colors flex-1">{cat.name}</span>
                <span className="text-label-sm text-on-surface-variant">({cat.count})</span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="bg-surface-container-lowest rounded-card p-space-xl shadow-subtle">
            <h4 className="text-title-md font-semibold mb-space-md">Khoảng giá</h4>
            <input type="range" min="0" max="500000" step="10000" className="w-full accent-primary" />
            <div className="flex justify-between text-label-sm text-on-surface-variant mt-1">
              <span>0đ</span>
              <span>500.000đ</span>
            </div>
          </div>

          <button className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined icon-sm">close</span>
            Xóa tất cả bộ lọc
          </button>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-space-lg">
            <span className="text-body-md text-on-surface-variant">
              Hiển thị {filtered.length} sản phẩm
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-input px-space-md py-space-xs text-body-md appearance-none cursor-pointer"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="price-low">Điểm: Thấp → Cao</option>
              <option value="price-high">Điểm: Cao → Thấp</option>
            </select>
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-lg"
          >
            <AnimatePresence>
              {filtered.map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-space-4xl">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-space-md block">search_off</span>
              <p className="text-body-lg text-on-surface-variant">Không tìm thấy sản phẩm nào phù hợp.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-space-xs mt-space-3xl">
            {[1, 2, 3].map(page => (
              <button
                key={page}
                className={`w-10 h-10 rounded-full text-label-lg font-semibold transition-all
                  ${page === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant'}`}
              >
                {page}
              </button>
            ))}
            <button className="w-10 h-10 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant flex items-center justify-center">
              <span className="material-symbols-outlined icon-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Cart Bar if cart has items */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-primary text-on-primary rounded-hero p-3.5 px-5 shadow-level-3 flex items-center justify-between border border-leaf-green/40 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary-fixed text-[22px]">shopping_bag</span>
              </div>
              <div>
                <p className="text-label-md font-bold">
                  {cart.reduce((s, i) => s + (i.qty || 1), 0)} sản phẩm trong giỏ
                </p>
                <p className="text-body-sm text-[#DCEEDF]">
                  Tổng: {cart.reduce((s, i) => s + ((i.priceVND || 0) * (i.qty || 1)), 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (cart[0]) openPurchaseModal(cart[0]);
              }}
              className="px-4 py-2 bg-secondary-fixed text-primary rounded-input font-bold text-label-md hover:bg-white transition-colors flex items-center gap-1.5"
            >
              Thanh toán ngay
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
