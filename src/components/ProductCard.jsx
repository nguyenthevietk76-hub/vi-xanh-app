import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import Chip from './Chip';
import { calcBonusPoints } from '../lib/points';

export default function ProductCard({ product, className = '' }) {
  const { wallet, redeemProduct, openPurchaseModal, openTradeIn } = useApp();
  const { addToCart } = useCart();
  const [hasError, setHasError] = useState(false);

  const canAfford = wallet.points >= product.points;
  const pointsNeeded = product.points - wallet.points;
  const progressPercent = Math.min((wallet.points / product.points) * 100, 100);
  // Thưởng khi mua: 1 điểm / 10.000đ (cộng khi đơn hoàn tất)
  const bonusPoints = calcBonusPoints(product.priceVND);
  // Chỉ sản phẩm brand thật (có brandId, tồn kho lấy real-time từ Firestore) mới cần chặn khi hết hàng
  const outOfStock = Boolean(product.brandId) && (product.stock || 0) <= 0;

  const badgeMap = {
    sale: { label: `-${product.salePercent || 15}%`, variant: 'sale' },
    hot: { label: 'Bán chạy', variant: 'hot' },
    new: { label: 'Mới', variant: 'new' },
    'points-only': { label: 'Ưu đãi xanh', variant: 'points-only' },
  };

  const badge = product.badge ? badgeMap[product.badge] : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`
        group bg-surface-container-lowest rounded-card overflow-hidden
        shadow-level-2 hover:shadow-level-2-hover
        transition-all duration-200 flex flex-col border border-outline-variant/30
        ${className}
      `}
    >
      {/* Image Container */}
      <div className="relative bg-surface-container-low p-3 m-3 rounded-nested aspect-square overflow-hidden">
        <Link to={`/san-pham/${product.id}`} aria-label={`Xem chi tiết ${product.name}`} className="absolute inset-0 z-0" />
        <img
          src={hasError ? '/images/products/binh_giu_nhiet.jpg' : (product.image || '/images/products/binh_giu_nhiet.jpg')}
          alt={product.name}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-nested-sm transition-transform duration-300 group-hover:scale-105 pointer-events-none"
        />
        {/* Badge */}
        {badge && (
          <div className="absolute top-5 left-5">
            <Chip variant={badge.variant}>{badge.label}</Chip>
          </div>
        )}
        {/* Wishlist */}
        <button 
          onClick={() => addToCart(product)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container-lowest/85 backdrop-blur-sm flex items-center justify-center hover:bg-surface-container-lowest transition-colors shadow-sm"
          title="Thêm vào yêu thích"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary">favorite</span>
        </button>
        {/* Low stock warning */}
        {product.stock <= 10 && (
          <div className="absolute bottom-5 left-5">
            <Chip variant="reject" className="text-[10px]">Còn {product.stock} suất</Chip>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-1 flex flex-col flex-1">
        {/* Rating & Category */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-sunlit-ochre-text">star</span>
            <span className="text-label-sm text-on-surface font-semibold">{product.rating}</span>
            <span className="text-label-sm text-on-surface-variant">({product.reviews})</span>
          </div>
          <span className="text-label-sm text-secondary font-medium">
            {product.category}{product.brandName ? ` · ${product.brandName}` : ''}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-title-md text-on-surface font-semibold leading-snug mb-1.5 line-clamp-2 min-h-[44px]">
          <Link to={`/san-pham/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline gap-space-xs mb-1">
          {product.priceVND ? (
            <>
              <span className="text-title-lg text-primary font-bold">
                {product.priceVND.toLocaleString('vi-VN')}đ
              </span>
              {product.priceOriginal && (
                <span className="text-body-sm text-on-surface-variant line-through">
                  {product.priceOriginal.toLocaleString('vi-VN')}đ
                </span>
              )}
            </>
          ) : (
            <span className="text-title-lg text-primary font-bold">
              {product.points.toLocaleString('vi-VN')} điểm xanh
            </span>
          )}
        </div>

        {/* Points alternative & Bonus Tag */}
        <div className="flex items-center justify-between text-body-sm text-secondary mb-1">
          <span>hoặc {product.points.toLocaleString('vi-VN')} điểm</span>
          {bonusPoints > 0 && (
            <span className="text-[11px] font-semibold text-leaf-green bg-primary-container/80 px-1.5 py-0.5 rounded">
              +{bonusPoints} điểm khi mua
            </span>
          )}
        </div>

        {/* Social proof */}
        <p className="text-label-sm text-on-surface-variant mb-2">
          {product.weeklyRedeemed} lượt giao dịch tuần này
        </p>

        {/* Points progress (if not enough points) */}
        {!canAfford && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-sunlit-ochre-text font-medium">
                Ví thiếu {pointsNeeded.toLocaleString('vi-VN')} điểm
              </span>
              <span className="text-[11px] text-on-surface-variant">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1 bg-surface-container-high rounded-chip overflow-hidden">
              <div
                className="h-full bg-sunlit-ochre rounded-chip transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Purchase & Action Buttons */}
        <div className="mt-auto pt-space-sm space-y-2">
          {/* Main Action: NÚT MUA NGAY (Buy Now) */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => openPurchaseModal(product)}
              disabled={outOfStock}
              className="flex-1 h-11 bg-primary text-on-primary rounded-input font-bold text-label-lg
                       hover:bg-secondary hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 shadow-subtle disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[19px]">shopping_cart</span>
              {outOfStock ? 'Hết hàng' : 'Mua ngay'}
            </motion.button>

            {/* Quick Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => addToCart(product)}
              title="Thêm vào giỏ hàng"
              className="w-11 h-11 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 rounded-input flex items-center justify-center text-primary transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            </motion.button>
          </div>

          {/* Secondary Action: Đổi bằng điểm */}
          {canAfford ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => redeemProduct(product)}
              disabled={outOfStock}
              className="w-full h-10 bg-[#DCEEDF] text-primary hover:bg-[#cbe3ce] rounded-nested font-semibold text-label-md
                       transition-colors duration-200 flex items-center justify-center gap-1.5 border border-[#a2cfaf]/70 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">eco</span>
              {outOfStock ? 'Hết hàng' : `Đổi bằng ${product.points.toLocaleString('vi-VN')} điểm`}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={openTradeIn}
              className="w-full h-10 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant rounded-nested font-medium text-label-sm
                       transition-colors duration-200 flex items-center justify-center gap-1.5 border border-outline-variant/50"
            >
              <span className="material-symbols-outlined text-[16px] text-sunlit-ochre-text">recycling</span>
              Đổi đồ cũ để nhận điểm
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
