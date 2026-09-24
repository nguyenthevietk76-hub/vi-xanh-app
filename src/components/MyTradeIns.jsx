import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getTradeInRate } from '../lib/points';
import Chip from './Chip';

const STATUS_MAP = {
  pending:  { label: 'Chờ cân & xác nhận', variant: 'default' },
  approved: { label: 'Đã cộng điểm',      variant: 'eco' },
  rejected: { label: 'Không đạt',         variant: 'reject' },
};

// Yêu cầu thu gom của người dùng — trạng thái cập nhật real-time khi admin duyệt
export default function MyTradeIns() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    // Chỉ lọc theo userId (không cần composite index), sắp xếp phía client
    const q = query(collection(db, 'tradeIns'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setItems(list.slice(0, 10));
    }, (err) => console.warn('Không tải được yêu cầu thu gom:', err));
    return unsub;
  }, [user]);

  if (!user || items.length === 0) return null;

  return (
    <div className="mb-space-3xl">
      <div className="flex items-center gap-space-md mb-space-lg">
        <h2 className="text-headline-sm text-primary font-bold">Yêu cầu thu gom của bạn</h2>
        <span className="text-label-md text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-chip">{items.length} yêu cầu</span>
      </div>
      <div className="space-y-space-xs">
        {items.map(t => {
          const status = STATUS_MAP[t.status] || STATUS_MAP.pending;
          const rate = getTradeInRate(t.finalCategoryId || t.categoryId);
          const kg = t.status === 'approved' ? t.actualWeightKg : t.declaredWeightKg;
          const points = t.status === 'approved' ? t.points : t.estimatedPoints;
          return (
            <div key={t.id} className="bg-surface-container-lowest rounded-card p-space-lg flex items-center gap-space-md shadow-subtle">
              <div className="w-12 h-12 rounded-nested bg-[#DCEEDF] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined icon-lg text-primary">{rate?.icon || 'recycling'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-on-surface font-medium truncate">{kg}kg {rate?.shortName.toLowerCase()}</p>
                <p className="text-label-sm text-on-surface-variant mt-0.5 truncate">
                  {t.collectionPoint || 'Điểm thu gom'} · {t.createdAt?.toDate
                    ? t.createdAt.toDate().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                    : 'Vừa xong'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {t.status !== 'rejected' && (
                  <span className={`text-title-md font-bold ${t.status === 'approved' ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {t.status === 'approved' ? '+' : '~'}{points || 0} điểm
                  </span>
                )}
                <Chip variant={status.variant}>{status.label}</Chip>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
