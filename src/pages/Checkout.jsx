import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useCart, groupByShop } from '../context/CartContext';
import { useProduct } from '../lib/useProduct';
import { calcBonusPoints } from '../lib/points';
import { generateOrderCode, getVietQRUrl, isVietQRConfigured } from '../lib/vietqr';
import LoadingFallback from '../components/LoadingFallback';

const FALLBACK_IMG = '/images/products/binh_giu_nhiet.jpg';
const SHIPPING_KEY = 'vx_shipping';

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Thanh toán khi nhận hàng', icon: 'local_atm' },
  { id: 'VIETQR', label: 'Chuyển khoản VietQR', icon: 'qr_code_2' },
  { id: 'MOMO', label: 'Ví MoMo', icon: 'account_balance_wallet' },
];

function loadShipping() {
  try {
    const s = JSON.parse(localStorage.getItem(SHIPPING_KEY) || 'null');
    return s && typeof s === 'object' ? s : null;
  } catch {
    return null;
  }
}

function saveShipping(info) {
  try { localStorage.setItem(SHIPPING_KEY, JSON.stringify(info)); } catch { /* bỏ qua */ }
}

const PHONE_RE = /^(0|\+84)\d{9,10}$/;

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();
  const { buyProduct } = useApp();
  const { items: cartItems, loaded: cartLoaded, removeFromCart } = useCart();

  const buyNow = state?.buyNow || null;
  const cartIds = state?.cartIds || null;
  const { product: buyNowProduct, loading: buyNowLoading } = useProduct(buyNow?.productId);

  // Danh sách dòng cần thanh toán: { productId, qty, product }
  const lines = useMemo(() => {
    if (buyNow) return buyNowProduct ? [{ productId: buyNow.productId, qty: buyNow.qty || 1, product: buyNowProduct }] : [];
    if (cartIds) {
      return cartItems.filter(i => cartIds.includes(i.productId) && i.product && !i.unavailable && !i.loading);
    }
    return [];
  }, [buyNow, buyNowProduct, cartIds, cartItems]);

  const [shipping, setShipping] = useState(() => loadShipping() || { name: user?.displayName || '', phone: '', address: '', note: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { orderCode, paid: [...], failed: [...], totalVND }
  const [copied, setCopied] = useState(false);

  const groups = useMemo(() => groupByShop(lines), [lines]);
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const totalVND = lines.reduce((s, l) => s + (l.product.priceVND || 0) * l.qty, 0);
  const bonus = lines.reduce((s, l) => s + calcBonusPoints((l.product.priceVND || 0) * l.qty), 0);
  const needsLogin = !user && lines.some(l => l.product.brandId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const phone = shipping.phone.replace(/[\s.-]/g, '');
    if (!shipping.name.trim() || !shipping.address.trim()) return setError('Vui lòng nhập đầy đủ họ tên và địa chỉ nhận hàng.');
    if (!PHONE_RE.test(phone)) return setError('Số điện thoại không hợp lệ (VD: 0912345678).');
    if (needsLogin) return setError('Vui lòng đăng nhập để đặt hàng.');

    setSubmitting(true);
    saveShipping(shipping);

    const customerInfo = {
      name: shipping.name.trim(),
      phone,
      address: shipping.address.trim() + (shipping.note?.trim() ? ` (Ghi chú: ${shipping.note.trim()})` : ''),
    };
    // Một mã chung cho mọi đơn của lần thanh toán này → khách chỉ chuyển khoản 1 lần
    const orderCode = generateOrderCode();
    const done = [];
    const failed = [];

    // Mỗi sản phẩm là 1 đơn (firestore.rules đối chiếu giá/tồn kho theo từng đơn).
    // Tạo lần lượt để lỗi của 1 sản phẩm không chặn các sản phẩm còn lại.
    for (const line of lines) {
      const res = await buyProduct({
        product: line.product,
        quantity: line.qty,
        customerInfo,
        paymentMethod,
        orderCode,
        silent: true,
      });
      if (res && !res.error) done.push({ ...line, totalVND: res.totalVND });
      else failed.push({ ...line, error: res?.error || 'Đặt hàng thất bại.' });
    }

    setSubmitting(false);
    setResult({
      orderCode,
      done,
      failed,
      totalVND: done.reduce((s, d) => s + (d.totalVND || 0), 0),
    });
    window.scrollTo(0, 0);

    // Xoá khỏi giỏ các sản phẩm đã đặt thành công (sau khi đã hiển thị kết quả)
    if (cartIds && done.length > 0) await removeFromCart(done.map(d => d.productId));
  };

  // ── Kết quả đặt hàng ──
  if (result) {
    const needTransfer = paymentMethod !== 'COD' && result.done.length > 0;
    return (
      <div className="max-w-2xl mx-auto w-full px-margin-mobile md:px-margin-tablet py-space-2xl">
        <div className="bg-surface-container-lowest rounded-hero shadow-level-2 border border-outline-variant/30 p-space-xl space-y-space-lg">
          {result.done.length > 0 ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-[56px] text-leaf-green block mb-space-xs">check_circle</span>
              <h1 className="text-headline-sm font-bold">Đặt hàng thành công!</h1>
              <p className="text-body-md text-on-surface-variant mt-space-xs">
                {result.done.length} đơn hàng · mã thanh toán <strong className="text-primary">#{result.orderCode}</strong>
              </p>
            </div>
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined text-[56px] text-coral-mist-text block mb-space-xs">error</span>
              <h1 className="text-headline-sm font-bold">Chưa đặt được đơn nào</h1>
            </div>
          )}

          {needTransfer && (
            <div className="border border-outline-variant/40 rounded-card p-space-lg space-y-space-md">
              <p className="text-label-lg font-bold text-center">Chuyển khoản {result.totalVND.toLocaleString('vi-VN')}đ để hoàn tất</p>
              {isVietQRConfigured && paymentMethod === 'VIETQR' ? (
                <div className="flex justify-center">
                  <img
                    src={getVietQRUrl({ amount: result.totalVND, orderCode: result.orderCode })}
                    alt={`Mã QR chuyển khoản ${result.orderCode}`}
                    className="w-64 h-auto rounded-nested border border-outline-variant/40"
                  />
                </div>
              ) : (
                <p className="text-body-sm text-on-surface-variant text-center">
                  {paymentMethod === 'MOMO' ? 'Mở ví MoMo và chuyển khoản với nội dung bên dưới.' : 'Chuyển khoản với nội dung bên dưới.'}
                  {!isVietQRConfigured && <><br />(Chủ shop chưa cấu hình tài khoản nhận tiền — QR chưa hiển thị được.)</>}
                </p>
              )}
              <div className="flex items-center justify-center gap-space-sm">
                <span className="text-body-sm text-on-surface-variant">Nội dung:</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(result.orderCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1 font-bold text-primary bg-primary-container/40 px-2.5 py-1 rounded-nested"
                >
                  {result.orderCode}
                  <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            </div>
          )}

          {result.done.length > 0 && (
            <ul className="divide-y divide-outline-variant/30 text-body-sm">
              {result.done.map(d => (
                <li key={d.productId} className="flex justify-between gap-space-md py-space-sm">
                  <span className="truncate">{d.product.name} × {d.qty}</span>
                  <span className="font-semibold shrink-0">{(d.totalVND || 0).toLocaleString('vi-VN')}đ</span>
                </li>
              ))}
            </ul>
          )}

          {result.failed.length > 0 && (
            <div className="bg-coral-mist/40 rounded-card p-space-md text-body-sm space-y-1">
              <p className="font-semibold text-coral-mist-text">Không đặt được {result.failed.length} sản phẩm (vẫn còn trong giỏ):</p>
              {result.failed.map(f => <p key={f.productId}>• {f.product.name}: {f.error}</p>)}
            </div>
          )}

          <div className="flex gap-space-sm">
            <Link to="/cua-hang" className="flex-1 h-11 rounded-input border border-outline-variant flex items-center justify-center font-semibold hover:bg-surface-container-low">
              Tiếp tục mua sắm
            </Link>
            <Link to="/vi-cua-toi" className="flex-1 h-11 rounded-input bg-primary text-on-primary flex items-center justify-center font-bold">
              Xem đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if ((buyNow && buyNowLoading) || (cartIds && !cartLoaded)) return <LoadingFallback />;

  if (lines.length === 0) {
    return (
      <div className="max-w-content mx-auto w-full px-margin-mobile py-space-4xl text-center">
        <span className="material-symbols-outlined text-[56px] text-outline-variant block mb-space-md">shopping_bag</span>
        <p className="text-title-md font-semibold mb-space-xl">Chưa có sản phẩm nào để thanh toán.</p>
        <button onClick={() => navigate('/gio-hang')} className="px-6 h-11 bg-primary text-on-primary rounded-input font-bold">
          Về giỏ hàng
        </button>
      </div>
    );
  }

  const inputCls = 'w-full bg-surface-container-low border border-outline-variant rounded-nested px-3 py-2.5 text-body-md focus:outline-none focus:border-primary';

  return (
    <form onSubmit={handleSubmit} className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-2xl">
      <div className="flex items-center gap-space-sm mb-space-xl">
        <span className="material-symbols-outlined text-primary text-[28px]">receipt_long</span>
        <h1 className="text-headline-sm sm:text-headline-md font-bold">Thanh toán</h1>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-space-lg items-start">
        <div className="space-y-space-lg min-w-0">
          {/* Shipping */}
          <section className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-space-lg">
            <h2 className="text-title-md font-bold flex items-center gap-1.5 mb-space-md text-primary">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              Địa chỉ nhận hàng
            </h2>
            <div className="grid sm:grid-cols-2 gap-space-md">
              <label className="block">
                <span className="text-label-sm text-on-surface-variant block mb-1">Họ và tên</span>
                <input required autoComplete="name" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-label-sm text-on-surface-variant block mb-1">Số điện thoại</span>
                <input required type="tel" autoComplete="tel" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} className={inputCls} placeholder="0912345678" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-label-sm text-on-surface-variant block mb-1">Địa chỉ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)</span>
                <input required autoComplete="street-address" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} className={inputCls} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-label-sm text-on-surface-variant block mb-1">Ghi chú cho người bán (không bắt buộc)</span>
                <input value={shipping.note || ''} maxLength={120} onChange={e => setShipping({ ...shipping, note: e.target.value })} className={inputCls} />
              </label>
            </div>
          </section>

          {/* Items by shop */}
          {groups.map(group => (
            <section key={group.key} className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 overflow-hidden">
              <header className="flex items-center gap-space-sm px-space-lg py-space-md border-b border-outline-variant/30">
                <span className="material-symbols-outlined text-[20px] text-primary">storefront</span>
                <span className="font-semibold truncate">{group.name}</span>
              </header>
              <ul className="divide-y divide-outline-variant/30">
                {group.items.map(l => (
                  <li key={l.productId} className="flex items-center gap-space-md px-space-lg py-space-md">
                    <img src={l.product.image || FALLBACK_IMG} alt="" className="w-16 h-16 object-cover rounded-nested bg-surface-container-low shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{l.product.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{(l.product.priceVND || 0).toLocaleString('vi-VN')}đ × {l.qty}</p>
                    </div>
                    <p className="font-bold text-primary shrink-0">{((l.product.priceVND || 0) * l.qty).toLocaleString('vi-VN')}đ</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Summary */}
        <aside className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-space-lg space-y-space-lg lg:sticky lg:top-24">
          <div>
            <h2 className="text-title-md font-bold mb-space-md">Phương thức thanh toán</h2>
            <div className="space-y-space-xs">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full flex items-center gap-space-sm p-space-md rounded-nested border text-left transition-colors ${
                    paymentMethod === pm.id ? 'border-primary bg-primary-container/40 text-primary font-semibold' : 'border-outline-variant/60 hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{pm.icon}</span>
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 text-body-md border-t border-outline-variant/30 pt-space-md">
            <div className="flex justify-between"><span className="text-on-surface-variant">Tạm tính ({totalQty} sản phẩm)</span><span>{totalVND.toLocaleString('vi-VN')}đ</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Phí vận chuyển</span><span className="text-leaf-green font-semibold">Miễn phí</span></div>
            {bonus > 0 && (
              <div className="flex justify-between"><span className="text-on-surface-variant">Điểm xanh nhận được</span><span className="text-leaf-green font-semibold">+{bonus} điểm</span></div>
            )}
            <div className="flex justify-between items-baseline pt-space-sm border-t border-dashed border-outline-variant/40">
              <span className="font-semibold">Tổng thanh toán</span>
              <span className="text-headline-sm text-primary font-bold">{totalVND.toLocaleString('vi-VN')}đ</span>
            </div>
            {groups.length > 1 && (
              <p className="text-[11px] text-on-surface-variant">Đơn sẽ được tách theo {groups.length} shop, dùng chung 1 mã thanh toán.</p>
            )}
          </div>

          {error && <p className="text-body-sm text-coral-mist-text bg-coral-mist/40 rounded-nested p-space-sm">{error}</p>}

          {needsLogin ? (
            <button type="button" onClick={loginWithGoogle} className="w-full h-12 bg-primary text-on-primary rounded-input font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">login</span>
              Đăng nhập để đặt hàng
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-primary text-on-primary rounded-input font-bold text-label-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>Đang đặt hàng…</>
              ) : 'Đặt hàng'}
            </button>
          )}
        </aside>
      </div>
    </form>
  );
}
