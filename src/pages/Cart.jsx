import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, groupByShop, MAX_CART_QTY } from '../context/CartContext';
import { calcBonusPoints } from '../lib/points';
import LoadingFallback from '../components/LoadingFallback';

const FALLBACK_IMG = '/images/logo.png'; // ảnh trung tính khi ảnh sản phẩm lỗi

function Checkbox({ checked, indeterminate = false, disabled, onChange, label }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={label}
      className="w-[18px] h-[18px] accent-primary cursor-pointer disabled:cursor-not-allowed shrink-0"
    />
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, loaded, setQty, removeFromCart } = useCart();

  const available = useMemo(() => items.filter(i => !i.unavailable && !i.loading && i.product), [items]);
  const [selected, setSelected] = useState(() => new Set());
  const initialised = useRef(false);

  // Lần đầu có dữ liệu: chọn sẵn mọi sản phẩm còn hàng
  useEffect(() => {
    if (initialised.current || !loaded || items.some(i => i.loading)) return;
    initialised.current = true;
    setSelected(new Set(available.map(i => i.productId)));
  }, [loaded, items, available]);

  // Bỏ chọn các dòng đã bị xoá hoặc hết hàng
  useEffect(() => {
    setSelected(prev => {
      const ok = new Set(available.map(i => i.productId));
      const next = new Set([...prev].filter(id => ok.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [available]);

  const groups = useMemo(() => groupByShop(items), [items]);
  const selectedItems = available.filter(i => selected.has(i.productId));
  const totalQty = selectedItems.reduce((s, i) => s + i.qty, 0);
  const totalVND = selectedItems.reduce((s, i) => s + (i.product.priceVND || 0) * i.qty, 0);
  const bonus = selectedItems.reduce((s, i) => s + calcBonusPoints((i.product.priceVND || 0) * i.qty), 0);
  const allSelected = available.length > 0 && selectedItems.length === available.length;

  const toggle = (ids, on) => setSelected(prev => {
    const next = new Set(prev);
    ids.forEach(id => (on ? next.add(id) : next.delete(id)));
    return next;
  });

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    navigate('/thanh-toan', { state: { cartIds: selectedItems.map(i => i.productId) } });
  };

  if (!loaded) return <LoadingFallback />;

  return (
    <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-2xl pb-40">
      <div className="flex items-center gap-space-sm mb-space-xl">
        <span className="material-symbols-outlined text-primary text-[28px]">shopping_cart</span>
        <h1 className="text-headline-sm sm:text-headline-md font-bold">Giỏ hàng</h1>
        {items.length > 0 && <span className="text-body-md text-on-surface-variant">({items.length} sản phẩm)</span>}
      </div>

      {items.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-hero shadow-subtle border border-outline-variant/30 py-space-4xl px-space-xl text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant block mb-space-md">remove_shopping_cart</span>
          <p className="text-title-md font-semibold mb-space-xs">Giỏ hàng của bạn còn trống</p>
          <p className="text-body-md text-on-surface-variant mb-space-xl">Khám phá sản phẩm xanh và thêm vào giỏ nhé.</p>
          <Link to="/cua-hang" className="inline-flex items-center gap-1.5 px-6 h-11 bg-primary text-on-primary rounded-input font-bold">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <>
          {/* Column header (desktop) */}
          <div className="hidden md:grid grid-cols-[28px_minmax(0,1fr)_130px_140px_130px_60px] items-center gap-space-md bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 px-space-lg py-space-md mb-space-md text-body-sm text-on-surface-variant">
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && selectedItems.length > 0}
              disabled={available.length === 0}
              onChange={(e) => toggle(available.map(i => i.productId), e.target.checked)}
              label="Chọn tất cả"
            />
            <span className="text-on-surface">Sản phẩm</span>
            <span className="text-center">Đơn giá</span>
            <span className="text-center">Số lượng</span>
            <span className="text-center">Số tiền</span>
            <span className="text-center">Thao tác</span>
          </div>

          <div className="space-y-space-md">
            {groups.map(group => {
              const groupAvailable = group.items.filter(i => !i.unavailable && !i.loading && i.product);
              const groupSelected = groupAvailable.filter(i => selected.has(i.productId));
              const groupAll = groupAvailable.length > 0 && groupSelected.length === groupAvailable.length;
              return (
                <section key={group.key} className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 overflow-hidden">
                  <header className="flex items-center gap-space-md px-space-md md:px-space-lg py-space-md border-b border-outline-variant/30">
                    <Checkbox
                      checked={groupAll}
                      indeterminate={!groupAll && groupSelected.length > 0}
                      disabled={groupAvailable.length === 0}
                      onChange={(e) => toggle(groupAvailable.map(i => i.productId), e.target.checked)}
                      label={`Chọn tất cả sản phẩm của ${group.name}`}
                    />
                    <span className="material-symbols-outlined text-[20px] text-primary">storefront</span>
                    <span className="font-semibold truncate">{group.name}</span>
                  </header>

                  <ul className="divide-y divide-outline-variant/30">
                    {group.items.map(item => {
                      const p = item.product;
                      const disabled = item.unavailable || item.loading || !p;
                      const stock = typeof p?.stock === 'number' ? p.stock : MAX_CART_QTY;
                      const maxQty = Math.max(1, Math.min(MAX_CART_QTY, stock));
                      const lineTotal = (p?.priceVND || 0) * item.qty;
                      return (
                        <li
                          key={item.productId}
                          className={`grid grid-cols-[28px_minmax(0,1fr)] md:grid-cols-[28px_minmax(0,1fr)_130px_140px_130px_60px] items-center gap-x-space-md gap-y-space-sm px-space-md md:px-space-lg py-space-md ${disabled ? 'opacity-60' : ''}`}
                        >
                          <Checkbox
                            checked={selected.has(item.productId)}
                            disabled={disabled}
                            onChange={(e) => toggle([item.productId], e.target.checked)}
                            label={`Chọn ${p?.name || 'sản phẩm'}`}
                          />

                          {/* Product */}
                          <div className="flex items-center gap-space-md min-w-0">
                            <Link to={`/san-pham/${item.productId}`} className="shrink-0">
                              <img
                                src={p?.image || FALLBACK_IMG}
                                alt={p?.name || ''}
                                className="w-20 h-20 object-cover rounded-nested bg-surface-container-low"
                              />
                            </Link>
                            <div className="min-w-0">
                              <Link to={`/san-pham/${item.productId}`} className="font-medium line-clamp-2 hover:text-primary">
                                {item.loading ? 'Đang tải…' : (p?.name || 'Sản phẩm không còn tồn tại')}
                              </Link>
                              {item.unavailable && (
                                <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-coral-mist text-coral-mist-text">
                                  {!p ? 'Ngừng bán' : p.redeemOnly ? 'Chỉ đổi bằng điểm' : 'Hết hàng'}
                                </span>
                              )}
                              {/* Mobile: price */}
                              {p && (
                                <p className="md:hidden text-primary font-bold mt-1">{(p.priceVND || 0).toLocaleString('vi-VN')}đ</p>
                              )}
                            </div>
                          </div>

                          {/* Unit price (desktop) */}
                          <div className="hidden md:block text-center">
                            {p?.priceOriginal && p.priceOriginal > (p.priceVND || 0) && (
                              <p className="text-body-sm text-on-surface-variant line-through">{p.priceOriginal.toLocaleString('vi-VN')}đ</p>
                            )}
                            <p>{(p?.priceVND || 0).toLocaleString('vi-VN')}đ</p>
                          </div>

                          {/* Qty + actions (mobile row spans) */}
                          <div className="col-start-2 md:col-start-auto flex items-center justify-between md:justify-center gap-space-md">
                            <div className="flex items-center border border-outline-variant rounded-nested overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setQty(item.productId, item.qty - 1, stock)}
                                disabled={disabled || item.qty <= 1}
                                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-40"
                                aria-label="Giảm số lượng"
                              >
                                <span className="material-symbols-outlined text-[16px]">remove</span>
                              </button>
                              <span className="w-10 text-center font-semibold border-x border-outline-variant leading-8">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => setQty(item.productId, item.qty + 1, stock)}
                                disabled={disabled || item.qty >= maxQty}
                                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-40"
                                aria-label="Tăng số lượng"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              className="md:hidden text-body-sm text-on-surface-variant hover:text-coral-mist-text"
                            >
                              Xoá
                            </button>
                          </div>

                          {/* Line total (desktop) */}
                          <p className="hidden md:block text-center text-primary font-bold">{lineTotal.toLocaleString('vi-VN')}đ</p>

                          {/* Remove (desktop) */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="hidden md:flex justify-center text-on-surface-variant hover:text-coral-mist-text"
                            aria-label="Xoá khỏi giỏ"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          {/* Sticky checkout bar */}
          <div className="fixed left-0 right-0 bottom-20 md:bottom-0 z-40 px-margin-mobile md:px-margin-tablet pb-space-sm md:pb-space-md pointer-events-none">
            <div className="max-w-content mx-auto bg-surface-container-lowest rounded-card shadow-level-3 border border-outline-variant/40 px-space-md md:px-space-lg py-space-md flex items-center gap-space-md flex-wrap pointer-events-auto">
              <label className="flex items-center gap-space-sm cursor-pointer">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && selectedItems.length > 0}
                  disabled={available.length === 0}
                  onChange={(e) => toggle(available.map(i => i.productId), e.target.checked)}
                  label="Chọn tất cả"
                />
                <span className="text-body-sm">Chọn tất cả ({available.length})</span>
              </label>
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={() => removeFromCart(selectedItems.map(i => i.productId))}
                className="text-body-sm text-on-surface-variant hover:text-coral-mist-text disabled:opacity-40"
              >
                Xoá đã chọn
              </button>

              <div className="ml-auto flex items-center gap-space-md">
                <div className="text-right">
                  <p className="text-body-sm">
                    Tổng ({totalQty} sản phẩm):{' '}
                    <span className="text-title-lg text-primary font-bold">{totalVND.toLocaleString('vi-VN')}đ</span>
                  </p>
                  {bonus > 0 && <p className="text-[11px] text-leaf-green font-semibold">+{bonus} điểm xanh khi đơn hoàn tất</p>}
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="h-11 px-6 bg-primary text-on-primary rounded-input font-bold text-label-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Mua hàng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
