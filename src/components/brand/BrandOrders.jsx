import { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Chip from '../Chip';
import { ORDER_STATUS_MAP, OPEN_STATUSES, formatVND, orderGross } from '../../lib/revenue';

// Luồng trạng thái hợp lệ — khớp isValidStatusTransition trong firestore.rules
const ORDER_STATUS_TRANSITIONS = {
  buy: {
    pending:   ['confirmed', 'cancelled'],
    confirmed: ['shipping'],
    shipping:  ['completed'],
    completed: [],
    cancelled: [],
  },
  redeem: {
    pending:   ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  },
};

const PAYMENT_STATUS_MAP = {
  cod:    { label: 'COD',             variant: 'default' },
  unpaid: { label: 'Chưa thanh toán', variant: 'milestone' },
  paid:   { label: 'Đã thanh toán',   variant: 'eco' },
};
const PAYMENT_METHOD_LABEL = { COD: 'COD', VIETQR: 'VietQR', MOMO: 'MoMo' };

const FILTERS = [
  { id: 'all', label: 'Tất cả', match: () => true },
  { id: 'pending', label: 'Chờ xử lý', match: (o) => o.status === 'pending' },
  { id: 'open', label: 'Đang giao', match: (o) => o.status === 'confirmed' || o.status === 'shipping' },
  { id: 'completed', label: 'Hoàn thành', match: (o) => o.status === 'completed' },
  { id: 'cancelled', label: 'Đã huỷ', match: (o) => o.status === 'cancelled' },
  { id: 'redeem', label: 'Đổi quà', match: (o) => o.type === 'redeem' },
];
const PAGE = 20;

export default function BrandOrders({ orders, user, showToast, confirmOrderPayment, initialFilter = 'all' }) {
  const [filter, setFilter] = useState(initialFilter);
  const [shown, setShown] = useState(PAGE);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { setFilter(initialFilter); }, [initialFilter]);
  useEffect(() => { setShown(PAGE); }, [filter]);

  const counts = useMemo(() => Object.fromEntries(FILTERS.map(f => [f.id, orders.filter(f.match).length])), [orders]);
  const list = useMemo(() => orders.filter(FILTERS.find(f => f.id === filter)?.match || (() => true)), [orders, filter]);

  // Cập nhật trạng thái trong CÙNG transaction:
  //  - Đơn mua "Hoàn thành" → cộng điểm thưởng (pointsEarned) cho người mua
  //  - Đơn đổi quà / đơn mua có dùng điểm giảm giá "Đã huỷ" → hoàn lại điểm (pointsUsed)
  //  - Đơn bị huỷ → hoàn lại tồn kho sản phẩm
  const updateOrderStatus = async (order, newStatus) => {
    if (updatingId) return;
    if (newStatus === 'cancelled' && !confirm('Huỷ đơn này? Tồn kho và điểm (nếu có) sẽ được hoàn lại.')) return;
    setUpdatingId(order.id);
    try {
      await runTransaction(db, async (tx) => {
        const orderRef = doc(db, 'orders', order.id);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists()) throw new Error('Đơn hàng không còn tồn tại.');
        const current = orderSnap.data();
        const type = current.type || 'buy';
        const allowed = ORDER_STATUS_TRANSITIONS[type]?.[current.status] || [];
        if (!allowed.includes(newStatus)) throw new Error('Trạng thái đơn đã thay đổi, vui lòng tải lại.');

        if (newStatus === 'completed' && type === 'buy'
            && (current.paymentMethod || 'COD') !== 'COD' && current.paymentStatus !== 'paid') {
          throw new Error('Hãy xác nhận đã nhận tiền trước khi hoàn thành đơn chuyển khoản.');
        }

        const creditPoints =
          type === 'buy' && newStatus === 'completed' ? (current.pointsEarned || 0)
          : newStatus === 'cancelled' ? (current.pointsUsed || 0)
          : 0;

        // Đọc hết trước khi ghi. Không đọc hồ sơ người mua (rules không cho) — cộng điểm bằng increment().
        const buyerRef = creditPoints > 0 && current.buyerId ? doc(db, 'users', current.buyerId) : null;
        const productRef = newStatus === 'cancelled' && current.productId ? doc(db, 'products', current.productId) : null;
        const productSnap = productRef ? await tx.get(productRef) : null;

        tx.update(orderRef, { status: newStatus });
        if (buyerRef) tx.update(buyerRef, { points: increment(creditPoints), lastCreditOrderId: order.id });
        if (productSnap?.exists()) {
          tx.update(productRef, { stock: (productSnap.data().stock || 0) + (current.quantity || 1) });
        }
      });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Không thể cập nhật đơn hàng, thử lại sau.' });
      return;
    } finally {
      setUpdatingId(null);
    }

    if (order.buyerId) {
      try {
        const label = ORDER_STATUS_MAP[newStatus]?.label || newStatus;
        await addDoc(collection(db, 'notifications', order.buyerId, 'items'), {
          type: 'order_status',
          title: `Đơn hàng: ${label}`,
          message: `Đơn hàng "${order.productName}" của bạn vừa được cập nhật trạng thái thành: ${label}.`,
          link: '/vi-cua-toi',
          fromUid: user.uid,
          orderId: order.id,
          readAt: null,
          createdAt: serverTimestamp(),
        });
      } catch (errNotif) {
        console.warn('Không thể gửi thông báo cập nhật đơn hàng:', errNotif);
      }
    }
  };

  return (
    <div>
      {/* Bộ lọc — trượt ngang trên điện thoại */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 h-9 px-3.5 rounded-full text-label-md font-semibold border transition-colors ${
              filter === f.id ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/60 hover:border-primary'
            }`}
          >
            {f.label} <span className="opacity-70">({counts[f.id]})</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-card border border-dashed border-outline-variant p-8 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px] block mb-2">receipt_long</span>
          Không có đơn nào ở mục này.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.slice(0, shown).map(o => {
            const type = o.type || 'buy';
            const statusInfo = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.pending;
            const awaitingPayment = type === 'buy' && (o.paymentMethod || 'COD') !== 'COD' && o.paymentStatus !== 'paid';
            const transitions = (ORDER_STATUS_TRANSITIONS[type]?.[o.status] || []).filter(s => !(awaitingPayment && s === 'completed'));
            const busy = updatingId === o.id;
            const time = o.createdAt?.toDate
              ? o.createdAt.toDate().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
              : 'Vừa xong';
            return (
              <li key={o.id} className={`bg-surface-container-lowest rounded-card shadow-subtle border p-3 sm:p-4 ${OPEN_STATUSES.includes(o.status) ? 'border-outline-variant/50' : 'border-outline-variant/20'}`}>
                <div className="flex gap-3">
                  <img src={o.productImage || '/images/logo.png'} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-surface-container-low shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-label-lg font-semibold leading-snug line-clamp-2">
                        {o.productName}{o.quantity > 1 ? ` ×${o.quantity}` : ''}
                      </p>
                      <p className="text-label-lg font-bold text-primary tabular-nums shrink-0 text-right">
                        {type === 'redeem' ? `${o.pointsUsed} điểm` : formatVND(o.totalVND)}
                      </p>
                    </div>
                    {type !== 'redeem' && o.pointsUsed > 0 && (
                      <p className="text-label-sm text-leaf-green font-medium mt-0.5">
                        Giá {formatVND(orderGross(o))} · khách dùng {o.pointsUsed} điểm giảm giá
                      </p>
                    )}
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      {o.orderCode ? `#${o.orderCode} · ` : ''}{time}
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5 break-words">
                      {o.buyerName || o.buyerEmail}{o.buyerPhone ? ` · ${o.buyerPhone}` : ''}
                      {o.buyerAddress ? <span className="block">{o.buyerAddress}</span> : null}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-outline-variant/30">
                  <Chip variant={statusInfo.variant}>{statusInfo.label}</Chip>
                  {type === 'redeem' && <Chip variant="points-only">Đổi quà</Chip>}
                  {o.paymentStatus && (
                    <Chip variant={(PAYMENT_STATUS_MAP[o.paymentStatus] || PAYMENT_STATUS_MAP.cod).variant}>
                      {o.paymentMethod && o.paymentMethod !== 'COD' ? `${PAYMENT_METHOD_LABEL[o.paymentMethod] || o.paymentMethod} · ` : ''}
                      {(PAYMENT_STATUS_MAP[o.paymentStatus] || PAYMENT_STATUS_MAP.cod).label}
                    </Chip>
                  )}

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto">
                    {o.paymentStatus === 'unpaid' && (
                      <button onClick={() => confirmOrderPayment(o)} disabled={busy}
                        className="flex-1 sm:flex-none h-9 px-3 rounded-lg bg-sky-tint text-primary text-label-sm font-bold disabled:opacity-50">
                        Đã nhận tiền
                      </button>
                    )}
                    {transitions.map(s => (
                      <button
                        key={s}
                        onClick={() => updateOrderStatus(o, s)}
                        disabled={busy}
                        className={`flex-1 sm:flex-none h-9 px-3 rounded-lg text-label-sm font-bold disabled:opacity-50 ${
                          s === 'cancelled' ? 'bg-surface-container-low text-coral-mist-text hover:bg-coral-mist' : 'bg-primary text-on-primary hover:bg-secondary'
                        }`}
                      >
                        {busy ? '…' : s === 'cancelled' ? 'Huỷ đơn' : `→ ${ORDER_STATUS_MAP[s]?.label || s}`}
                      </button>
                    ))}
                  </div>
                </div>
                {awaitingPayment && o.status === 'shipping' && (
                  <p className="text-[11px] text-on-surface-variant mt-2">Xác nhận đã nhận tiền để hoàn thành đơn chuyển khoản.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {list.length > shown && (
        <button onClick={() => setShown(n => n + PAGE)}
          className="mt-4 w-full h-11 rounded-input border border-outline-variant bg-surface-container-lowest text-label-lg font-semibold hover:bg-surface-container-low">
          Xem thêm {Math.min(PAGE, list.length - shown)} đơn
        </button>
      )}
    </div>
  );
}
