import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchBrandTotals, fetchPlatformTotals, formatVND, formatShortVND, downloadCSV } from '../../lib/revenue';

// Tổng quan toàn sàn + doanh thu từng brand.
// Dùng Firestore aggregation (sum/count trên server) → không tải từng đơn về máy, nhanh dù có nhiều brand.
const BATCH = 5; // số brand truy vấn song song mỗi lượt

function Tile({ icon, label, value, sub, accent }) {
  return (
    <div className={`rounded-card p-4 shadow-subtle border border-outline-variant/30 ${accent ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest'}`}>
      <div className={`flex items-center gap-1.5 text-label-sm font-semibold ${accent ? 'text-on-primary/75' : 'text-on-surface-variant'}`}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span>{label}
      </div>
      <div className="text-title-lg sm:text-headline-sm font-bold mt-1 tabular-nums">{value}</div>
      {sub && <div className={`text-label-sm mt-0.5 ${accent ? 'text-on-primary/75' : 'text-on-surface-variant'}`}>{sub}</div>}
    </div>
  );
}

export default function PlatformOverview({ brands }) {
  const approved = useMemo(() => brands.filter(b => b.status === 'approved'), [brands]);
  const approvedKey = approved.map(b => b.id).join(',');

  const [platform, setPlatform] = useState(null);
  const [rows, setRows] = useState({}); // brandId → totals | { error }
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPlatform(await fetchPlatformTotals());
    } catch (err) {
      console.error('Lỗi tổng quan sàn:', err);
      setError('Không tải được số liệu toàn sàn. ' + (err.code === 'failed-precondition' ? 'Firestore cần tạo index — mở Console (F12) để lấy link tạo.' : ''));
    }
    const ids = approvedKey ? approvedKey.split(',') : [];
    const next = {};
    for (let i = 0; i < ids.length; i += BATCH) {
      const chunk = ids.slice(i, i + BATCH);
      const results = await Promise.all(chunk.map(id => fetchBrandTotals(id).catch(err => {
        console.error('Lỗi số liệu brand', id, err);
        return { error: err.code || 'lỗi' };
      })));
      chunk.forEach((id, k) => { next[id] = results[k]; });
      setRows({ ...next });
    }
    setUpdatedAt(new Date());
    setLoading(false);
  }, [approvedKey]);

  useEffect(() => { load(); }, [load]);

  const table = useMemo(() => approved
    .map(b => ({ brand: b, t: rows[b.id] }))
    .sort((a, b) => (b.t?.grossVND || 0) - (a.t?.grossVND || 0)), [approved, rows]);
  const maxGross = Math.max(1, ...table.map(r => r.t?.grossVND || 0));

  const exportCSV = () => {
    downloadCSV(`vi-xanh-doanh-thu-brand-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Brand', 'Email', 'Sản phẩm', 'Đơn hoàn thành', 'Doanh thu (giá bán)', 'Khách đã trả', 'Giảm bằng điểm xanh', 'Đơn đang xử lý'],
      ...table.map(({ brand, t }) => [
        brand.brandName, brand.ownerEmail, t?.productCount ?? '', t?.completedCount ?? '',
        t?.grossVND ?? '', t?.paidVND ?? '', t?.discountVND ?? '', t?.openCount ?? '',
      ]),
    ]);
  };

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between gap-3 flex-wrap mb-3">
        <div>
          <h2 className="text-title-lg font-bold">Tổng quan toàn sàn</h2>
          <p className="text-label-sm text-on-surface-variant">
            Doanh thu tính trên đơn đã hoàn thành{updatedAt ? ` · cập nhật ${updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={loading || table.length === 0}
            className="h-10 px-3.5 rounded-full border border-outline-variant bg-surface-container-lowest text-label-md font-semibold flex items-center gap-1.5 disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">download</span>CSV
          </button>
          <button onClick={load} disabled={loading}
            className="h-10 px-3.5 rounded-full bg-primary text-on-primary text-label-md font-semibold flex items-center gap-1.5 disabled:opacity-60">
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            {loading ? 'Đang tải…' : 'Làm mới'}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mb-3 text-label-md bg-coral-mist text-coral-mist-text rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Tile accent icon="payments" label="Doanh thu toàn sàn" value={platform ? formatShortVND(platform.grossVND) : '…'} sub={platform ? `${platform.completedCount} đơn hoàn thành` : ''} />
        <Tile icon="account_balance_wallet" label="Khách đã trả" value={platform ? formatShortVND(platform.paidVND) : '…'} sub="tiền thực thu" />
        <Tile icon="eco" label="Giảm bằng điểm xanh" value={platform ? formatShortVND(platform.discountVND) : '…'} sub="cần đối soát với brand" />
        <Tile icon="local_shipping" label="Đơn đang xử lý" value={platform ? platform.openCount : '…'} sub="chờ xác nhận / đang giao" />
        <Tile icon="storefront" label="Brand hoạt động" value={approved.length} sub={`${brands.length - approved.length} hồ sơ khác`} />
        <Tile icon="inventory_2" label="Sản phẩm" value={platform ? platform.productCount : '…'} />
        <Tile icon="group" label="Người dùng" value={platform ? platform.userCount : '…'} />
        <Tile icon="redeem" label="Lượt đổi quà" value={platform ? platform.redeemCount : '…'} sub={platform ? `${platform.redeemPoints.toLocaleString('vi-VN')} điểm` : ''} />
      </div>

      <h3 className="text-title-md font-bold mb-2">Doanh thu theo brand</h3>
      {table.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">Chưa có brand nào được duyệt.</p>
      ) : (
        <>
          {/* Máy tính: bảng */}
          <div className="hidden md:block bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 overflow-hidden">
            <table className="w-full text-body-sm">
              <thead className="bg-surface-container-low text-on-surface-variant text-label-sm">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Brand</th>
                  <th className="text-right font-semibold px-3 py-3">Sản phẩm</th>
                  <th className="text-right font-semibold px-3 py-3">Đơn HT</th>
                  <th className="text-left font-semibold px-3 py-3 w-[28%]">Doanh thu</th>
                  <th className="text-right font-semibold px-3 py-3">Khách trả</th>
                  <th className="text-right font-semibold px-3 py-3">Giảm bằng điểm</th>
                  <th className="text-right font-semibold px-4 py-3">Đang xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {table.map(({ brand, t }) => (
                  <tr key={brand.id} className="hover:bg-surface-container-low/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{brand.brandName}</p>
                      <p className="text-label-sm text-on-surface-variant">{brand.ownerEmail}</p>
                    </td>
                    {!t ? (
                      <td colSpan={6} className="px-3 py-3 text-on-surface-variant">Đang tải…</td>
                    ) : t.error ? (
                      <td colSpan={6} className="px-3 py-3 text-coral-mist-text">Lỗi tải số liệu ({t.error})</td>
                    ) : (
                      <>
                        <td className="px-3 py-3 text-right tabular-nums">{t.productCount}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{t.completedCount}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                              <div className="h-full rounded-full bg-leaf-green" style={{ width: `${(t.grossVND / maxGross) * 100}%` }} />
                            </div>
                            <span className="font-semibold tabular-nums w-20 text-right">{formatShortVND(t.grossVND)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{formatVND(t.paidVND)}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{formatVND(t.discountVND)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{t.openCount > 0 ? <span className="font-semibold text-sunlit-ochre-text">{t.openCount}</span> : 0}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Điện thoại: thẻ */}
          <ul className="md:hidden space-y-2.5">
            {table.map(({ brand, t }) => (
              <li key={brand.id} className="bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{brand.brandName}</p>
                    <p className="text-label-sm text-on-surface-variant truncate">{brand.ownerEmail}</p>
                  </div>
                  <span className="text-title-md font-bold text-primary tabular-nums shrink-0">{t && !t.error ? formatShortVND(t.grossVND) : '…'}</span>
                </div>
                {t && !t.error && (
                  <>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden mt-2">
                      <div className="h-full rounded-full bg-leaf-green" style={{ width: `${(t.grossVND / maxGross) * 100}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2.5 text-label-sm text-on-surface-variant">
                      <span><strong className="text-on-surface">{t.completedCount}</strong> đơn HT</span>
                      <span><strong className="text-on-surface">{t.openCount}</strong> đang xử lý</span>
                      <span><strong className="text-on-surface">{t.productCount}</strong> sản phẩm</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mt-1">Khách trả {formatVND(t.paidVND)} · giảm bằng điểm {formatVND(t.discountVND)}</p>
                  </>
                )}
                {t?.error && <p className="text-label-sm text-coral-mist-text mt-1">Lỗi tải số liệu ({t.error})</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
