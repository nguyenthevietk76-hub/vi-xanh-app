import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useCart, MAX_CART_QTY } from '../context/CartContext';
import { useProduct } from '../lib/useProduct';
import { calcBonusPoints, isRedeemOnly, maxDiscountPoints, DISCOUNT_RULE_TEXT, POINT_VALUE_VND } from '../lib/points';
import ProductCard from '../components/ProductCard';
import Chip from '../components/Chip';
import LoadingFallback from '../components/LoadingFallback';

const FALLBACK_IMG = '/images/logo.png'; // ảnh trung tính khi ảnh sản phẩm lỗi

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet, redeemProduct, openTradeIn, products: mockProducts } = useApp();
  const { addToCart } = useCart();
  const { product, loading } = useProduct(id);

  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => { setQty(1); setImgError(false); }, [id]);

  // Sản phẩm cùng danh mục: brand (Firestore) + demo
  const [related, setRelated] = useState([]);
  const category = product?.category;
  useEffect(() => {
    if (!category) return;
    const q = query(collection(db, 'products'), where('category', '==', category), where('status', '==', 'active'), limit(8));
    const unsub = onSnapshot(q, (snap) => {
      setRelated(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => setRelated([]));
    return unsub;
  }, [category]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const demo = mockProducts.filter(p => p.category === product.category);
    return [...related, ...demo].filter(p => p.id !== product.id).slice(0, 4);
  }, [related, mockProducts, product]);

  if (loading) return <LoadingFallback />;

  if (!product) {
    return (
      <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet py-space-4xl text-center">
        <span className="material-symbols-outlined text-[56px] text-outline-variant block mb-space-md">inventory_2</span>
        <h2 className="text-title-lg font-bold mb-space-xs">Không tìm thấy sản phẩm</h2>
        <p className="text-body-md text-on-surface-variant mb-space-xl">Sản phẩm có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
        <Link to="/cua-hang" className="inline-flex items-center gap-1.5 px-5 h-11 bg-primary text-on-primary rounded-input font-bold">
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Về cửa hàng
        </Link>
      </div>
    );
  }

  const stock = typeof product.stock === 'number' ? product.stock : 0;
  const outOfStock = stock <= 0 || product.status === 'inactive';
  const isOwnProduct = Boolean(user && product.brandId === user.uid);
  const maxQty = Math.max(1, Math.min(MAX_CART_QTY, stock));
  const priceVND = product.priceVND || 0;
  const discount = product.priceOriginal && product.priceOriginal > priceVND
    ? Math.round((1 - priceVND / product.priceOriginal) * 100)
    : null;
  // Sản phẩm độc quyền: chỉ đổi trọn bằng điểm. Sản phẩm thường: điểm chỉ để giảm giá (tối đa 200/đơn)
  const exclusive = isRedeemOnly(product);
  const points = product.points || 0;
  const bonusPoints = exclusive ? 0 : calcBonusPoints(priceVND * qty);
  const maxDiscountVND = maxDiscountPoints(priceVND * qty) * POINT_VALUE_VND;
  const canAfford = wallet.points >= points;
  const description = product.description || product.desc || '';
  const shopName = product.brandName || 'Ví Xanh';

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product, qty);
    setAdding(false);
  };

  const handleBuyNow = () => {
    navigate('/thanh-toan', { state: { buyNow: { productId: product.id, qty } } });
  };

  return (
    <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-space-xs text-body-sm text-on-surface-variant mb-space-lg flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to="/cua-hang" className="hover:text-primary transition-colors">Cửa hàng</Link>
        {product.category && (
          <>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link to={`/cua-hang?q=${encodeURIComponent(product.category)}`} className="hover:text-primary transition-colors">{product.category}</Link>
          </>
        )}
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold truncate max-w-[240px]">{product.name}</span>
      </nav>

      {/* Main block */}
      <div className="bg-surface-container-lowest rounded-hero shadow-level-2 border border-outline-variant/30 p-space-md sm:p-space-xl grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-space-xl">
        {/* Image */}
        <div className="relative bg-surface-container-low rounded-card aspect-square overflow-hidden">
          <img
            src={imgError ? FALLBACK_IMG : (product.image || FALLBACK_IMG)}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          {exclusive ? (
            <div className="absolute top-space-md left-space-md">
              <Chip variant="points-only" icon="workspace_premium">Độc quyền đổi điểm</Chip>
            </div>
          ) : discount && (
            <div className="absolute top-space-md left-space-md">
              <Chip variant="sale">-{discount}%</Chip>
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
              <span className="px-5 py-2 rounded-chip bg-surface-container-lowest text-on-surface font-bold">{exclusive ? 'Đã hết quà' : 'Hết hàng'}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-headline-sm sm:text-headline-md font-bold text-on-surface leading-snug mb-space-sm">
            {product.name}
          </h1>

          {/* Rating · sold */}
          <div className="flex items-center gap-space-md text-body-sm text-on-surface-variant mb-space-lg flex-wrap">
            {product.rating ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-on-surface underline underline-offset-2">{product.rating}</span>
                  <span className="material-symbols-outlined text-[16px] text-sunlit-ochre-text">star</span>
                </span>
                <span className="w-px h-4 bg-outline-variant" />
                <span><span className="font-semibold text-on-surface">{product.reviews ?? 0}</span> đánh giá</span>
              </>
            ) : (
              <span>Chưa có đánh giá</span>
            )}
            {product.weeklyRedeemed > 0 && (
              <>
                <span className="w-px h-4 bg-outline-variant" />
                <span><span className="font-semibold text-on-surface">{product.weeklyRedeemed}</span> lượt {exclusive ? 'đổi' : 'mua'} tuần này</span>
              </>
            )}
          </div>

          {/* Price block */}
          {exclusive ? (
          <div className="bg-eco-tint/50 border border-leaf-green/30 rounded-card p-space-md sm:p-space-lg mb-space-lg">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[28px] text-secondary">eco</span>
              <span className="text-headline-lg-mobile sm:text-headline-lg text-primary font-bold">
                {points.toLocaleString('vi-VN')} điểm xanh
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-space-xs">
              Quà độc quyền — không bán bằng tiền, chỉ dành cho thành viên đổi bằng điểm xanh tích được từ việc gửi quần áo cũ và bã cà phê.
            </p>
          </div>
          ) : (
          <div className="bg-surface-container-low rounded-card p-space-md sm:p-space-lg mb-space-lg">
            <div className="flex items-baseline gap-space-sm flex-wrap">
              {product.priceOriginal && product.priceOriginal > priceVND && (
                <span className="text-body-md text-on-surface-variant line-through">
                  {product.priceOriginal.toLocaleString('vi-VN')}đ
                </span>
              )}
              <span className="text-headline-lg-mobile sm:text-headline-lg text-primary font-bold">
                {priceVND.toLocaleString('vi-VN')}đ
              </span>
              {discount && <Chip variant="sale" className="!py-0.5 !px-2 text-[11px]">Giảm {discount}%</Chip>}
            </div>
            <div className="flex items-center gap-space-sm mt-space-xs flex-wrap text-body-sm">
              {maxDiscountVND > 0 && (
                <span className="text-secondary">
                  Dùng điểm xanh giảm đến <strong>{maxDiscountVND.toLocaleString('vi-VN')}đ</strong> ({DISCOUNT_RULE_TEXT})
                </span>
              )}
              {bonusPoints > 0 && (
                <span className="text-[11px] font-semibold text-leaf-green bg-eco-tint/80 px-1.5 py-0.5 rounded">
                  +{bonusPoints} điểm khi mua
                </span>
              )}
            </div>
          </div>
          )}

          {/* Details rows */}
          <dl className="grid grid-cols-[110px_1fr] gap-y-space-md text-body-md mb-space-xl">
            <dt className="text-on-surface-variant">Vận chuyển</dt>
            <dd className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">local_shipping</span>
              Miễn phí vận chuyển
            </dd>

            <dt className="text-on-surface-variant">Danh mục</dt>
            <dd>{product.category || '—'}</dd>

            {exclusive ? (
              <>
                <dt className="text-on-surface-variant">Còn lại</dt>
                <dd>{outOfStock ? 'Đã hết quà' : `${stock} suất · mỗi lần đổi 1 sản phẩm`}</dd>
              </>
            ) : (
            <>
            <dt className="text-on-surface-variant self-center">Số lượng</dt>
            <dd className="flex items-center gap-space-md flex-wrap">
              <div className="flex items-center border border-outline-variant rounded-nested overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1 || outOfStock}
                  className="w-9 h-9 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-40"
                  aria-label="Giảm số lượng"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={qty}
                  disabled={outOfStock}
                  onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
                  className="w-14 h-9 text-center border-x border-outline-variant bg-transparent font-semibold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Số lượng"
                />
                <button
                  type="button"
                  onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty || outOfStock}
                  className="w-9 h-9 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-40"
                  aria-label="Tăng số lượng"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
              <span className="text-body-sm text-on-surface-variant">
                {outOfStock ? 'Hết hàng' : `Còn ${stock} sản phẩm`}
              </span>
            </dd>
            </>
            )}
          </dl>

          {/* Actions */}
          {isOwnProduct ? (
            <div className="bg-surface-container-low rounded-card p-space-md text-body-sm text-on-surface-variant">
              Đây là sản phẩm của brand bạn. Quản lý trong{' '}
              <Link to="/brand/dashboard" className="text-primary font-semibold underline">Bảng điều khiển Brand</Link>.
            </div>
          ) : exclusive ? (
            <div className="mt-auto">
              {canAfford ? (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => redeemProduct(product)}
                  disabled={outOfStock}
                  className="w-full h-12 rounded-input bg-primary text-on-primary font-bold text-label-lg flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors shadow-subtle disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[20px]">redeem</span>
                  {outOfStock ? 'Đã hết quà' : `Đổi ngay bằng ${points.toLocaleString('vi-VN')} điểm`}
                </motion.button>
              ) : (
                <button
                  onClick={openTradeIn}
                  className="w-full h-12 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant rounded-input font-medium text-label-md flex items-center justify-center gap-1.5 border border-outline-variant/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-sunlit-ochre-text">recycling</span>
                  Ví còn thiếu {Math.max(0, points - wallet.points).toLocaleString('vi-VN')} điểm — đổi đồ cũ để nhận điểm
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-space-sm mt-auto">
              <div className="flex gap-space-sm">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={outOfStock || adding}
                  className="flex-1 h-12 rounded-input border-2 border-primary text-primary bg-eco-tint/30 font-bold text-label-lg flex items-center justify-center gap-1.5 hover:bg-eco-tint/60 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  Thêm vào giỏ
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className="flex-1 h-12 rounded-input bg-primary text-on-primary font-bold text-label-lg flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors shadow-subtle disabled:opacity-50 disabled:pointer-events-none"
                >
                  {outOfStock ? 'Hết hàng' : 'Mua ngay'}
                </motion.button>
              </div>
              <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">sell</span>
                Chọn dùng điểm xanh để giảm giá ở bước thanh toán.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Shop */}
      <div className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-space-md sm:p-space-lg mt-space-lg flex items-center gap-space-md">
        <div className="w-12 h-12 rounded-full bg-eco-tint flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">storefront</span>
        </div>
        <div className="min-w-0">
          <p className="text-title-md font-semibold truncate">{shopName}</p>
          <p className="text-body-sm text-on-surface-variant">
            {product.brandId ? 'Brand xanh đã được Ví Xanh xác minh' : 'Sản phẩm trưng bày của Ví Xanh'}
          </p>
        </div>
      </div>

      {/* Description */}
      <section className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-space-md sm:p-space-xl mt-space-lg">
        <h2 className="text-title-md font-bold mb-space-md px-space-sm py-space-xs bg-surface-container-low rounded-nested">Mô tả sản phẩm</h2>
        <p className="text-body-md text-on-surface whitespace-pre-line leading-relaxed">
          {description || 'Người bán chưa thêm mô tả cho sản phẩm này.'}
        </p>
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-space-2xl">
          <h2 className="text-title-lg font-bold mb-space-lg">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
