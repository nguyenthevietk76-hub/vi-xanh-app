import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import Chip from './Chip';
import { calcBonusPoints, isRedeemOnly, maxDiscountPoints, POINT_VALUE_VND } from '../lib/points';

const FALLBACK_IMG = '/images/logo.png'; // ảnh trung tính khi ảnh sản phẩm lỗi

export default function ProductCard({ product, className = '' }) {
  const { wallet, redeemProduct, openPurchaseModal, openTradeIn } = useApp();
  const { addToCart } = useCart();
  const [hasError, setHasError] = useState(false);

  const exclusive = isRedeemOnly(product);
  const points = product.points || 0;
  const priceVND = product.priceVND || 0;
  const canAfford = wallet.points >= points;
  const pointsNeeded = Math.max(0, points - wallet.points);
  const progressPercent = points > 0 ? Math.min((wallet.points / points) * 100, 100) : 0;
  // Sản phẩm thường: điểm là mã giảm giá (tối đa 200 điểm/đơn)
  const maxDiscountVND = maxDiscountPoints(priceVND) * POINT_VALUE_VND;
  const bonusPoints = exclusive ? 0 : calcBonusPoints(priceVND);
  const outOfStock = (product.stock ?? 0) <= 0;

  const badge = exclusive
    ? { label: 'Độc quyền đổi điểm', variant: 'points-only', icon: 'workspace_premium' }
    : product.isNew ? { label: 'Mới', variant: 'new' } : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`
        group bg-surface-container-lowest rounded-card overflow-hidden
        shadow-level-2 hover:shadow-level-2-hover
        transition-all duration-200 flex flex-col border
        ${exclusive ? 'border-leaf-green/50' : 'border-outline-variant/30'}
        ${className}
      `}
    >
      {/* Image Container */}
      <div className="relative bg-surface-container-low p-3 m-3 rounded-nested aspect-square overflow-hidden">
        <Link to={`/san-pham/${product.id}`} aria-label={`Xem chi tiết ${product.name}`} className="absolute inset-0 z-0" />
        <img
          src={hasError ? FALLBACK_IMG : (product.image || FALLBACK_IMG)}
          alt={product.name}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-nested-sm transition-transform duration-300 group-hover:scale-105 pointer-events-none"
        />
        {badge && (
          <div className="absolute top-5 left-5">
            <Chip variant={badge.variant} icon={badge.icon}>{badge.label}</Chip>
          </div>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute bottom-5 left-5">
            <Chip variant="reject" className="text-[10px]">Còn {product.stock} {exclusive ? 'suất' : 'sản phẩm'}</Chip>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-1 flex flex-col flex-1">
        {/* Rating & Category */}
        <div className="flex items-center justify-between gap-1 mb-1">
          {product.rating ? (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-sunlit-ochre-text">star</span>
              <span className="text-label-sm text-on-surface font-semibold">{product.rating}</span>
              <span className="text-label-sm text-on-surface-variant">({product.reviews || 0})</span>
            </div>
          ) : (
            <span className="text-label-sm text-on-surface-variant">Chưa có đánh giá</span>
          )}
          <span className="text-label-sm text-secondary font-medium truncate">
            {product.brandName || product.category}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-title-md text-on-surface font-semibold leading-snug mb-1.5 line-clamp-2 min-h-[44px]">
          <Link to={`/san-pham/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
        </h3>

        {/* Price */}
        {exclusive ? (
          <>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="material-symbols-outlined text-[18px] text-secondary self-center">eco</span>
              <span className="text-title-lg text-primary font-bold">{points.toLocaleString('vi-VN')} điểm xanh</span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-2">Không bán — chỉ đổi bằng điểm xanh</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-space-xs mb-1">
              <span className="text-title-lg text-primary font-bold">{priceVND.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-body-sm text-secondary mb-2">
              {maxDiscountVND > 0 && <span>Dùng điểm giảm đến {maxDiscountVND.toLocaleString('vi-VN')}đ</span>}
              {bonusPoints > 0 && (
                <span className="text-[11px] font-semibold text-leaf-green bg-primary-container/80 px-1.5 py-0.5 rounded shrink-0">
                  +{bonusPoints} điểm
                </span>
              )}
            </div>
          </>
        )}

        {product.weeklyRedeemed > 0 && (
          <p className="text-label-sm text-on-surface-variant mb-2">
            {product.weeklyRedeemed} lượt {exclusive ? 'đổi' : 'mua'} tuần này
          </p>
        )}

        {/* Points progress (exclusive, not enough points) */}
        {exclusive && !canAfford && (
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

        {/* Actions */}
        <div className="mt-auto pt-space-sm">
          {exclusive ? (
            canAfford ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => redeemProduct(product)}
                disabled={outOfStock}
                className="w-full h-11 bg-primary text-on-primary rounded-input font-bold text-label-lg hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 shadow-subtle disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[18px]">redeem</span>
                {outOfStock ? 'Đã hết quà' : `Đổi ${points.toLocaleString('vi-VN')} điểm`}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={openTradeIn}
                className="w-full h-11 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant rounded-input font-medium text-label-md transition-colors flex items-center justify-center gap-1.5 border border-outline-variant/50"
              >
                <span className="material-symbols-outlined text-[16px] text-sunlit-ochre-text">recycling</span>
                Đổi đồ cũ để nhận điểm
              </motion.button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => openPurchaseModal(product)}
                disabled={outOfStock}
                className="flex-1 h-11 bg-primary text-on-primary rounded-input font-bold text-label-lg hover:bg-secondary hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 shadow-subtle disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[19px]">shopping_cart</span>
                {outOfStock ? 'Hết hàng' : 'Mua ngay'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => addToCart(product)}
                disabled={outOfStock}
                title="Thêm vào giỏ hàng"
                aria-label="Thêm vào giỏ hàng"
                className="w-11 h-11 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 rounded-input flex items-center justify-center text-primary transition-colors shrink-0 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
