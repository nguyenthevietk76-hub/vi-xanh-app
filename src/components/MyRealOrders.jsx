import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Chip from './Chip';

// P0-2: Map trạng thái đơn hàng sang Chip variant + label tiếng Việt
const ORDER_STATUS_MAP = {
  pending:   { label: 'Chờ xử lý',    variant: 'default' },
  confirmed: { label: 'Đã xác nhận',  variant: 'eco' },
  shipping:  { label: 'Đang giao',    variant: 'delivery' },
  completed: { label: 'Hoàn thành',   variant: 'milestone' },
  cancelled: { label: 'Đã huỷ',      variant: 'reject' },
};

const PAYMENT_STATUS_MAP = {
  cod:    { label: 'COD',             variant: 'default' },
  unpaid: { label: 'Chưa thanh toán', variant: 'milestone' },
  paid:   { label: 'Đã thanh toán',   variant: 'eco' },
};

export default function MyRealOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) { setOrders([]); return; }
    const q = query(collection(db, 'orders'), where('buyerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  if (!user || orders.length === 0) return null;

  return (
    <div className="mb-space-3xl">
      <div className="flex items-center gap-space-md mb-space-lg">
        <h2 className="text-headline-sm text-primary font-bold">Đơn hàng thật từ đối tác Brand</h2>
        <span className="text-label-md text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-chip">{orders.length} đơn</span>
      </div>
      <div className="space-y-space-xs">
        {orders.map(o => {
          const statusInfo = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.pending;
          return (
            <div key={o.id} className="bg-surface-container-lowest rounded-card p-space-lg flex items-center gap-space-md shadow-subtle">
              <img src={o.productImage} alt={o.productName} className="w-12 h-12 object-cover rounded-nested shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-on-surface font-medium truncate">
                  {o.type === 'redeem' ? 'Đổi điểm: ' : 'Mua: '}{o.productName}{o.quantity > 1 ? ` x${o.quantity}` : ''}
                </p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  {o.brandName} · {o.createdAt?.toDate
                    ? o.createdAt.toDate().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                    : 'Vừa xong'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-title-md font-bold text-primary">
                  {o.type === 'redeem' ? `-${o.pointsUsed} điểm` : `${(o.totalVND || 0).toLocaleString('vi-VN')}đ`}
                </span>
                {/* P0-2: Chip trạng thái đơn hàng — cập nhật real-time */}
                <div className="flex items-center gap-1">
                  {o.paymentStatus && (
                    <Chip variant={(PAYMENT_STATUS_MAP[o.paymentStatus] || PAYMENT_STATUS_MAP.cod).variant}>
                      {(PAYMENT_STATUS_MAP[o.paymentStatus] || PAYMENT_STATUS_MAP.cod).label}
                    </Chip>
                  )}
                  <Chip variant={statusInfo.variant}>{statusInfo.label}</Chip>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
