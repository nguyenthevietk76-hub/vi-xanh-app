import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DISCOUNT_RULE_TEXT } from '../../lib/points';
import { uploadProductImage, deleteProductImage, isStorageConfigured, MAX_UPLOAD_MB } from '../../lib/supabaseStorage';
import { formatVND } from '../../lib/revenue';

export const CATEGORY_OPTIONS = ['Túi & phụ kiện', 'Đồ len đan tay', 'Trang trí nhà', 'Gốm & bếp', 'Nến & chăm sóc', 'Đồ dùng xanh', 'Khác'];
const EMPTY_FORM = { name: '', description: '', category: CATEGORY_OPTIONS[0], priceVND: '', points: '', stock: '', redeemOnly: false };

const inputCls = 'w-full h-11 px-3.5 bg-surface-container-low border border-outline-variant/60 rounded-input text-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors';
const labelCls = 'block text-label-md font-semibold mb-1.5';

export default function BrandProducts({ products, user, brand, showToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(null); // null = không tải; 0..100
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false); // chỉ dùng trên mobile
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const formRef = useRef(null);
  const fileRef = useRef(null);

  // Xem trước ảnh đã chọn
  useEffect(() => {
    if (!imageFile) { setPreview(editing?.image || ''); return; }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile, editing]);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setError('');
    setProgress(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: CATEGORY_OPTIONS.includes(p.category) ? p.category : 'Khác',
      priceVND: String(p.priceVND || ''),
      points: String(p.points || ''),
      stock: String(p.stock ?? ''),
      redeemOnly: p.redeemOnly === true,
    });
    setImageFile(null);
    setError('');
    setFormOpen(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    const priceOk = form.redeemOnly ? parseInt(form.points, 10) >= 1 : Number(form.priceVND) >= 1000;
    const stock = parseInt(form.stock, 10);
    if (!form.name.trim()) return setError('Vui lòng nhập tên sản phẩm.');
    if (!priceOk) return setError(form.redeemOnly ? 'Giá đổi phải từ 1 điểm trở lên.' : 'Giá bán phải từ 1.000đ trở lên.');
    if (!(stock >= 0)) return setError('Số lượng tồn kho không hợp lệ.');
    if (!editing && !imageFile) return setError('Vui lòng chọn ảnh sản phẩm.');

    setSubmitting(true);
    try {
      let image = editing?.image || '';
      if (imageFile) {
        setProgress(0);
        image = await uploadProductImage(imageFile, { onProgress: setProgress });
      }

      // Giá: độc quyền → chỉ giá điểm; thường → chỉ giá VNĐ (firestore.rules: isValidProductData)
      const pricing = form.redeemOnly
        ? { redeemOnly: true, points: parseInt(form.points, 10), priceVND: 0 }
        : { redeemOnly: false, priceVND: Math.round(Number(form.priceVND)), points: 0 };
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        ...pricing,
        stock,
        image,
      };

      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), data);
        if (imageFile && editing.image && editing.image !== image) deleteProductImage(editing.image);
        showToast({ type: 'success', message: `Đã cập nhật "${data.name}".` });
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          rating: null,
          reviews: 0,
          weeklyRedeemed: 0,
          badge: form.redeemOnly ? 'exclusive' : 'new',
          isNew: true,
          brandId: user.uid,
          brandName: brand?.brandName || '',
          status: 'active',
          createdAt: serverTimestamp(),
        });
        showToast({ type: 'success', message: `Đã đăng "${data.name}" lên Cửa hàng.` });
      }
      resetForm();
      setFormOpen(false);
    } catch (err) {
      const msg = err?.code === 'permission-denied'
        ? 'Không có quyền lưu sản phẩm. Kiểm tra brand đã được duyệt và firestore.rules đã publish bản mới.'
        : (err.message || 'Thao tác thất bại, thử lại sau.');
      setError(msg);
      setProgress(null);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (p) => {
    setBusyId(p.id);
    try {
      await updateDoc(doc(db, 'products', p.id), { status: p.status === 'inactive' ? 'active' : 'inactive' });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Không đổi được trạng thái.' });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Xoá vĩnh viễn "${p.name}"? Đơn hàng cũ vẫn được giữ.`)) return;
    setBusyId(p.id);
    try {
      await deleteDoc(doc(db, 'products', p.id));
      deleteProductImage(p.image);
      if (editing?.id === p.id) resetForm();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Không xoá được sản phẩm.' });
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? products.filter(p => (p.name || '').toLowerCase().includes(q)) : products;
    return [...list].sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  }, [products, search]);

  const activeCount = products.filter(p => p.status !== 'inactive').length;

  return (
    <div className="grid lg:grid-cols-[400px_minmax(0,1fr)] gap-5 items-start">
      {/* ── Form đăng / sửa ── */}
      <div ref={formRef} className="scroll-mt-40">
        <button
          type="button"
          onClick={() => setFormOpen(o => !o)}
          className={`lg:hidden w-full h-12 mb-3 rounded-input font-bold text-label-lg flex items-center justify-center gap-1.5 ${formOpen ? 'bg-surface-container-high text-on-surface' : 'bg-primary text-on-primary shadow-subtle'}`}
        >
          <span className="material-symbols-outlined text-[20px]">{formOpen ? 'expand_less' : 'add'}</span>
          {formOpen ? 'Thu gọn' : 'Đăng sản phẩm mới'}
        </button>

        <form
          onSubmit={handleSubmit}
          className={`${formOpen ? 'block' : 'hidden'} lg:block bg-surface-container-lowest rounded-card shadow-subtle border border-outline-variant/30 p-4 sm:p-5 space-y-4`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-title-md font-bold">{editing ? 'Sửa sản phẩm' : 'Đăng sản phẩm mới'}</h3>
            {editing && (
              <button type="button" onClick={resetForm} className="text-label-md text-on-surface-variant hover:text-primary">Huỷ sửa</button>
            )}
          </div>

          {!isStorageConfigured && (
            <p className="text-label-sm bg-coral-mist text-coral-mist-text rounded-lg p-2.5">
              Chưa cấu hình Supabase để lưu ảnh. Xem hướng dẫn trong SUPABASE_SETUP.md.
            </p>
          )}

          {/* Ảnh */}
          <div>
            <span className={labelCls}>Ảnh sản phẩm {editing ? '' : '*'}</span>
            <label className="group relative flex items-center justify-center aspect-[4/3] rounded-card border-2 border-dashed border-outline-variant hover:border-primary bg-surface-container-low overflow-hidden cursor-pointer transition-colors">
              {preview ? (
                <>
                  <img src={preview} alt="Xem trước" className="absolute inset-0 w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-primary/80 text-on-primary text-label-sm font-semibold">Đổi ảnh</span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-1 text-on-surface-variant text-center px-4">
                  <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                  <span className="text-label-md font-semibold">Chọn ảnh</span>
                  <span className="text-label-sm">JPG, PNG, WEBP · tự nén về ≤ {MAX_UPLOAD_MB}MB</span>
                </span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>
            {progress != null && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-leaf-green transition-[width] duration-200" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-label-sm text-on-surface-variant mt-1">Đang tải ảnh… {progress}%</p>
              </div>
            )}
          </div>

          <div>
            <label className={labelCls} htmlFor="bp-name">Tên sản phẩm *</label>
            <input id="bp-name" value={form.name} onChange={set('name')} maxLength={120} className={inputCls} />
          </div>

          <div>
            <label className={labelCls} htmlFor="bp-desc">Mô tả</label>
            <textarea id="bp-desc" value={form.description} onChange={set('description')} rows={3} maxLength={1000}
              className={`${inputCls} h-auto py-2.5 resize-y`} />
          </div>

          <div>
            <label className={labelCls} htmlFor="bp-cat">Danh mục</label>
            <select id="bp-cat" value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-input bg-surface-container-low cursor-pointer">
            <input type="checkbox" checked={form.redeemOnly} onChange={set('redeemOnly')} className="mt-0.5 w-5 h-5 accent-primary shrink-0" />
            <span>
              <span className="block text-label-md font-semibold">Quà độc quyền đổi điểm</span>
              <span className="block text-label-sm text-on-surface-variant">
                Không bán bằng tiền, chỉ đổi trọn bằng điểm xanh. Bỏ chọn để bán bình thường — khách được dùng điểm để giảm giá ({DISCOUNT_RULE_TEXT}).
              </span>
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {form.redeemOnly ? (
              <div>
                <label className={labelCls} htmlFor="bp-points">Giá đổi (điểm) *</label>
                <input id="bp-points" type="number" inputMode="numeric" min="1" step="1" value={form.points} onChange={set('points')} className={inputCls} />
              </div>
            ) : (
              <div>
                <label className={labelCls} htmlFor="bp-price">Giá bán (đ) *</label>
                <input id="bp-price" type="number" inputMode="numeric" min="1000" step="1000" value={form.priceVND} onChange={set('priceVND')} className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls} htmlFor="bp-stock">Tồn kho *</label>
              <input id="bp-stock" type="number" inputMode="numeric" min="0" step="1" value={form.stock} onChange={set('stock')} className={inputCls} />
            </div>
          </div>
          {!form.redeemOnly && Number(form.priceVND) >= 1000 && (
            <p className="text-label-sm text-on-surface-variant -mt-2">Hiển thị: <strong className="text-on-surface">{formatVND(form.priceVND)}</strong></p>
          )}

          {error && (
            <p role="alert" className="flex gap-1.5 text-label-md bg-coral-mist text-coral-mist-text rounded-lg p-2.5">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>{error}
            </p>
          )}

          <button type="submit" disabled={submitting}
            className="w-full h-12 bg-primary text-on-primary rounded-input font-bold text-label-lg flex items-center justify-center gap-2 disabled:opacity-70 hover:bg-secondary transition-colors">
            {submitting && <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>}
            {submitting
              ? (progress != null && progress < 100 ? 'Đang tải ảnh…' : 'Đang lưu…')
              : (editing ? 'Cập nhật sản phẩm' : 'Đăng sản phẩm')}
          </button>
        </form>
      </div>

      {/* ── Danh sách ── */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 className="text-title-md font-bold">
            Sản phẩm của bạn <span className="text-on-surface-variant font-normal">({activeCount} đang bán / {products.length})</span>
          </h3>
          {products.length > 5 && (
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sản phẩm…"
              aria-label="Tìm sản phẩm của bạn" className="h-10 px-3.5 w-full sm:w-56 bg-surface-container-lowest border border-outline-variant/60 rounded-full text-body-sm focus:outline-none focus:border-primary" />
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-card border border-dashed border-outline-variant p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] block mb-2">inventory_2</span>
            Chưa có sản phẩm nào. Đăng sản phẩm đầu tiên để bắt đầu bán.
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {filtered.map(p => {
              const inactive = p.status === 'inactive';
              const low = !inactive && (p.stock ?? 0) <= 5;
              return (
                <li key={p.id} className={`bg-surface-container-lowest rounded-card shadow-subtle border p-3 flex gap-3 ${editing?.id === p.id ? 'border-primary' : 'border-outline-variant/30'} ${inactive ? 'opacity-70' : ''}`}>
                  <img src={p.image || '/images/logo.png'} alt="" className="w-20 h-20 rounded-lg object-cover bg-surface-container-low shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-label-lg font-semibold line-clamp-2 leading-snug">{p.name}</p>
                    <p className="text-label-md font-bold text-primary mt-0.5">
                      {p.redeemOnly ? `${(p.points || 0).toLocaleString('vi-VN')} điểm` : formatVND(p.priceVND)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.redeemOnly && <span className="px-1.5 py-0.5 rounded bg-eco-tint text-leaf-green text-[11px] font-semibold">Độc quyền</span>}
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${low ? 'bg-coral-mist text-coral-mist-text' : 'bg-surface-container-low text-on-surface-variant'}`}>Còn {p.stock ?? 0}</span>
                      {inactive && <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">Đang ẩn</span>}
                    </div>
                    <div className="flex gap-1 mt-auto pt-2">
                      <button onClick={() => startEdit(p)} className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-label-sm font-semibold flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">edit</span>Sửa
                      </button>
                      <button onClick={() => toggleActive(p)} disabled={busyId === p.id} title={inactive ? 'Hiện lại trên Cửa hàng' : 'Tạm ẩn khỏi Cửa hàng'}
                        className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center disabled:opacity-50" aria-label={inactive ? 'Hiện sản phẩm' : 'Ẩn sản phẩm'}>
                        <span className="material-symbols-outlined text-[18px]">{inactive ? 'visibility' : 'visibility_off'}</span>
                      </button>
                      <button onClick={() => handleDelete(p)} disabled={busyId === p.id} title="Xoá"
                        className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-coral-mist text-coral-mist-text flex items-center justify-center disabled:opacity-50" aria-label="Xoá sản phẩm">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
