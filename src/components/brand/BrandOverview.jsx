import { useMemo, useState } from 'react';
import { summarizeOrders, formatVND, formatShortVND } from '../../lib/revenue';

const PERIODS = [
  { id: 7, label: '7 ngày' },
  { id: 30, label: '30 ngày' },
  { id: 90, label: '90 ngày' },
  { id: 0, label: 'Tất cả' },
];

function StatTile({ icon, label, value, sub, tone = 'default' }) {
  const toneCls = tone === 'accent' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface';
  const subCls = tone === 'accent' ? 'text-on-primary/75' : 'text-on-surface-variant';
  return (
    <div className={`rounded-card p-4 sm:p-5 shadow-subtle border border-outline-variant/30 ${toneCls}`}>
      <div className={`flex items-center gap-1.5 text-label-sm font-semibold ${subCls}`}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        {label}
      </div>
      <div className="text-title-lg sm:text-headline-sm font-bold mt-1.5 tabular-nums">{value}</div>
      {sub && <div className={`text-label-sm mt-0.5 ${subCls}`}>{sub}</div>}
    </div>
  );
}

// Biểu đồ cột doanh thu theo ngày — 1 chuỗi, 1 màu; tooltip khi rê chuột / chạm
function DailyRevenueChart({ days }) {
  const [active, setActive] = useState(null);
  const max = Math.max(1, ...days.map(d => d.grossVND));
  const total = days.reduce((s, d) => s + d.grossVND, 0);
  const shown = active != null ? days[active] : null;
  const fmtDay = (d) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  return (
    <div className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-title-md font-bold">Doanh thu theo ngày</h3>
          <p className="text-label-sm text-on-surface-variant">{days.length} ngày gần nhất · đơn hoàn thành</p>
        </div>
        <div className="text-right min-h-[40px]" aria-live="polite">
          {shown ? (
            <>
              <p className="text-label-sm text-on-surface-variant">{fmtDay(shown.date)} · {shown.orders} đơn</p>
              <p className="text-title-md font-bold text-primary tabular-nums">{formatVND(shown.grossVND)}</p>
            </>
          ) : (
            <>
              <p className="text-label-sm text-on-surface-variant">Tổng</p>
              <p className="text-title-md font-bold text-primary tabular-nums">{formatVND(total)}</p>
            </>
          )}
        </div>
      </div>

      <div className="relative h-40 sm:h-48">
        {/* Lưới mờ: đỉnh + giữa */}
        <div aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-outline-variant/50" />
        <div aria-hidden className="absolute inset-x-0 top-1/2 border-t border-dashed border-outline-variant/40" />
        <span aria-hidden className="absolute right-0 -top-4 text-[10px] text-on-surface-variant tabular-nums">{formatShortVND(max)}</span>

        <div
          role="img"
          aria-label={`Biểu đồ doanh thu ${days.length} ngày, tổng ${formatVND(total)}`}
          className="absolute inset-0 flex items-end gap-[2px]"
          onMouseLeave={() => setActive(null)}
        >
          {days.map((d, i) => {
            const pct = d.grossVND > 0 ? Math.max(3, (d.grossVND / max) * 100) : 0;
            const isActive = active === i;
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(isActive ? null : i)}
                className="group relative flex-1 h-full flex items-end focus:outline-none"
                aria-label={`${fmtDay(d.date)}: ${formatVND(d.grossVND)}, ${d.orders} đơn`}
              >
                {/* vùng bấm cao hết cột, thanh dữ liệu chỉ cao theo giá trị */}
                <span
                  className={`w-full rounded-t-[4px] transition-colors ${isActive ? 'bg-primary' : 'bg-leaf-green/80 group-hover:bg-primary'}`}
                  style={{ height: `${pct}%` }}
                />
                {d.grossVND === 0 && <span className="absolute bottom-0 inset-x-0 h-[2px] rounded bg-outline-variant/60" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between text-[10px] sm:text-label-sm text-on-surface-variant mt-1.5 tabular-nums">
        <span>{fmtDay(days[0].date)}</span>
        <span>{fmtDay(days[Math.floor(days.length / 2)].date)}</span>
        <span>Hôm nay</span>
      </div>
    </div>
  );
}

export default function BrandOverview({ orders, products, ordersLimited, onGoTo }) {
  const [period, setPeriod] = useState(30);

  const sinceMs = period ? Date.now() - period * 86400000 : 0;
  const summary = useMemo(
    () => summarizeOrders(orders, { sinceMs, days: period === 7 ? 7 : 30 }),
    [orders, sinceMs, period]
  );
  // Đơn cần xử lý ngay luôn tính trên toàn bộ, không phụ thuộc bộ lọc thời gian
  const needAction = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const lowStock = useMemo(() => products.filter(p => p.status !== 'inactive' && (p.stock ?? 0) <= 5), [products]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Bộ lọc thời gian */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div role="radiogroup" aria-label="Khoảng thời gian" className="inline-flex p-1 rounded-full bg-surface-container-low border border-outline-variant/40">
          {PERIODS.map(p => (
            <button
              key={p.id}
              role="radio"
              aria-checked={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 sm:px-4 h-9 rounded-full text-label-md font-semibold transition-colors ${period === p.id ? 'bg-primary text-on-primary shadow-subtle' : 'text-on-surface-variant hover:text-primary'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {ordersLimited && (
          <p className="text-label-sm text-on-surface-variant">Đang tính trên 500 đơn gần nhất</p>
        )}
      </div>

      {/* Việc cần làm */}
      {(needAction.length > 0 || summary.unpaidTransfers > 0 || lowStock.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {needAction.length > 0 && (
            <button onClick={() => onGoTo('orders', 'pending')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-sunlit-ochre text-sunlit-ochre-text text-label-md font-semibold">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              {needAction.length} đơn chờ xác nhận
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          )}
          {summary.unpaidTransfers > 0 && (
            <button onClick={() => onGoTo('orders', 'all')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-sky-tint text-primary text-label-md font-semibold">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              {summary.unpaidTransfers} đơn chờ chuyển khoản
            </button>
          )}
          {lowStock.length > 0 && (
            <button onClick={() => onGoTo('products')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-coral-mist text-coral-mist-text text-label-md font-semibold">
              <span className="material-symbols-outlined text-[18px]">inventory</span>
              {lowStock.length} sản phẩm sắp hết hàng
            </button>
          )}
        </div>
      )}

      {/* Số liệu chính */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile tone="accent" icon="payments" label="Doanh thu" value={formatShortVND(summary.grossVND)} sub={`${summary.completedCount} đơn hoàn thành`} />
        <StatTile icon="account_balance_wallet" label="Khách đã trả" value={formatShortVND(summary.paidVND)} sub="tiền thực nhận từ khách" />
        <StatTile icon="eco" label="Giảm bằng điểm xanh" value={formatShortVND(summary.discountVND)} sub="phần khách dùng điểm" />
        <StatTile icon="local_shipping" label="Đang xử lý" value={`${summary.openCount} đơn`} sub={`trị giá ${formatShortVND(summary.openVND)}`} />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-4">
        <DailyRevenueChart days={summary.byDay} />

        {/* Sản phẩm bán chạy — cũng là dạng bảng cho số liệu doanh thu */}
        <div className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-4 sm:p-5">
          <h3 className="text-title-md font-bold mb-3">Bán chạy nhất</h3>
          {summary.topProducts.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant py-6 text-center">Chưa có đơn hoàn thành trong khoảng thời gian này.</p>
          ) : (
            <ol className="space-y-2.5">
              {summary.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-label-md font-bold text-on-surface-variant text-center">{i + 1}</span>
                  {p.image
                    ? <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface-container-low shrink-0" />
                    : <span className="w-10 h-10 rounded-lg bg-surface-container-low shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-label-lg font-semibold truncate">{p.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{p.qty} sản phẩm đã bán</p>
                  </div>
                  <span className="text-label-lg font-bold text-primary tabular-nums shrink-0">{formatShortVND(p.grossVND)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Ghi chú cách tính */}
      <div className="grid sm:grid-cols-3 gap-3 text-label-sm text-on-surface-variant">
        <p className="flex gap-1.5"><span className="material-symbols-outlined text-[16px] text-leaf-green">info</span>Doanh thu = giá bán × số lượng của đơn đã hoàn thành (gồm cả phần giảm bằng điểm).</p>
        <p className="flex gap-1.5"><span className="material-symbols-outlined text-[16px] text-leaf-green">redeem</span>{summary.redeemCount} lượt đổi quà bằng điểm ({summary.redeemPoints.toLocaleString('vi-VN')} điểm) — không tính vào doanh thu.</p>
        <p className="flex gap-1.5"><span className="material-symbols-outlined text-[16px] text-leaf-green">block</span>{summary.cancelledCount} đơn đã huỷ — không tính vào doanh thu.</p>
      </div>
    </div>
  );
}
