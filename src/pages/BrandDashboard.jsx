import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, updateDoc, doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Chip from '../components/Chip';
import { DISCOUNT_RULE_TEXT } from '../lib/points';

const CATEGORY_OPTIONS = ['Túi & phụ kiện', 'Đồ len đan tay', 'Trang trí nhà', 'Gốm & bếp', 'Nến & chăm sóc', 'Đồ dùng xanh', 'Khác'];

// P0-2: Luồng trạng thái hợp lệ cho đơn hàng
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

const ORDER_STATUS_MAP = {
  pending:   { label: 'Chờ xử lý',   variant: 'default' },
  confirmed: { label: 'Đã xác nhận', variant: 'eco' },
  shipping:  { label: 'Đang giao',   variant: 'delivery' },
  completed: { label: 'Hoàn thành',  variant: 'milestone' },
  cancelled: { label: 'Đã huỷ',     variant: 'reject' },
};

// Trạng thái thanh toán riêng — khác với vòng đời giao hàng ở trên
const PAYMENT_STATUS_MAP = {
  cod:    { label: 'COD',            variant: 'default' },
  unpaid: { label: 'Chưa thanh toán', variant: 'milestone' },
  paid:   { label: 'Đã thanh toán',   variant: 'eco' },
};
const PAYMENT_METHOD_LABEL = { COD: 'COD', VIETQR: 'VietQR / CK', MOMO: 'Ví MoMo' };

// P1-4: Nén ảnh phía client trước khi upload — giới hạn cạnh dài 1200px, chất lượng JPEG 80%
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function BrandDashboard() {
  const { user, brand } = useAuth();
  const { confirmOrderPayment, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  // redeemOnly = sản phẩm độc quyền: không bán, chỉ đổi trọn bằng điểm (giá = points).
  // Sản phẩm thường: bán bằng VNĐ, người mua được dùng điểm để giảm giá (DISCOUNT_RULE_TEXT).
  const [form, setForm] = useState({ name: '', description: '', category: CATEGORY_OPTIONS[0], priceVND: '', points: '', stock: '', redeemOnly: false });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // P1-1: Chế độ edit — lưu product đang sửa
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'products'), where('brandId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('brandId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
  };

  // P1-1: Bấm "Sửa" → prefill form
  const startEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category || CATEGORY_OPTIONS[0],
      priceVND: String(product.priceVND || ''),
      points: String(product.points || ''),
      stock: String(product.stock || ''),
      redeemOnly: product.redeemOnly === true,
    });
    setImageFile(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', category: CATEGORY_OPTIONS[0], priceVND: '', points: '', stock: '', redeemOnly: false });
    setImageFile(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const priceMissing = form.redeemOnly ? !(parseInt(form.points, 10) >= 1) : !(Number(form.priceVND) > 0);
    if (!form.name.trim() || priceMissing || form.stock === '') {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    // Ở chế độ tạo mới, ảnh là bắt buộc; chế độ edit cho phép giữ ảnh cũ
    if (!editingProduct && !imageFile) {
      setError('Vui lòng chọn ảnh sản phẩm.');
      return;
    }
    setSubmitting(true);
    try {
      let imageURL = editingProduct?.image || '';

      // Upload ảnh mới (nếu có) — P1-4: nén trước khi upload
      if (imageFile) {
        const compressed = await compressImage(imageFile);
        const imgRef = ref(storage, `product-images/${user.uid}/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imgRef, compressed);
        imageURL = await getDownloadURL(imgRef);
      }

      // Giá: độc quyền → chỉ giá điểm; thường → chỉ giá VNĐ (firestore.rules: isValidProductData)
      const pricing = form.redeemOnly
        ? { redeemOnly: true, points: parseInt(form.points, 10), priceVND: 0 }
        : { redeemOnly: false, priceVND: Number(form.priceVND), points: 0 };

      if (editingProduct) {
        // P1-1: Cập nhật sản phẩm hiện có
        await updateDoc(doc(db, 'products', editingProduct.id), {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          ...pricing,
          stock: parseInt(form.stock, 10) || 0,
          image: imageURL,
        });
        cancelEdit();
      } else {
        // Tạo sản phẩm mới
        await addDoc(collection(db, 'products'), {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          ...pricing,
          stock: parseInt(form.stock, 10) || 0,
          image: imageURL,
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
        setForm({ name: '', description: '', category: CATEGORY_OPTIONS[0], priceVND: '', points: '', stock: '', redeemOnly: false });
        setImageFile(null);
        e.target.reset();
      }
    } catch (err) {
      setError(err.message || 'Thao tác thất bại, thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Xoá sản phẩm này?')) return;
    await deleteDoc(doc(db, 'products', productId));
  };

  // P0-2: Cập nhật trạng thái đơn hàng + P1-3: Thông báo cho khách hàng
  // Trong CÙNG transaction:
  //  - Đơn mua "Hoàn thành"  → cộng điểm thưởng (pointsEarned) cho người mua
  //  - Đơn đổi điểm / đơn mua có dùng điểm giảm giá "Đã huỷ" → hoàn lại điểm (pointsUsed)
  //  - Đơn bị huỷ           → hoàn lại tồn kho sản phẩm
  // firestore.rules chỉ cho phép cộng đúng số điểm ghi trên đơn, và chỉ 1 lần.
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const updateOrderStatus = async (order, newStatus) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(order.id);
    try {
      await runTransaction(db, async (tx) => {
        const orderRef = doc(db, 'orders', order.id);
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists()) throw new Error('Đơn hàng không còn tồn tại.');
        const current = orderSnap.data();
        const allowed = ORDER_STATUS_TRANSITIONS[current.type || 'buy']?.[current.status] || [];
        if (!allowed.includes(newStatus)) throw new Error('Trạng thái đơn đã thay đổi, vui lòng tải lại.');

        const creditPoints =
          current.type === 'buy' && newStatus === 'completed' ? (current.pointsEarned || 0)
          : current.type === 'redeem' && newStatus === 'cancelled' ? (current.pointsUsed || 0)
          // Đơn mua đã dùng điểm giảm giá bị huỷ → hoàn lại số điểm đã dùng
          : (current.type || 'buy') === 'buy' && newStatus === 'cancelled' ? (current.pointsUsed || 0)
          : 0;

        if (newStatus === 'completed' && (current.type || 'buy') === 'buy'
            && (current.paymentMethod || 'COD') !== 'COD' && current.paymentStatus !== 'paid') {
          throw new Error('Hãy xác nhận đã nhận tiền trước khi hoàn thành đơn chuyển khoản.');
        }

        // Đọc hết trước khi ghi (yêu cầu của Firestore transaction).
        // Không đọc hồ sơ người mua (rules không cho) — cộng điểm bằng increment().
        const buyerRef = creditPoints > 0 && current.buyerId ? doc(db, 'users', current.buyerId) : null;
        const productRef = newStatus === 'cancelled' && current.productId ? doc(db, 'products', current.productId) : null;
        const productSnap = productRef ? await tx.get(productRef) : null;

        tx.update(orderRef, { status: newStatus });

        if (buyerRef) {
          tx.update(buyerRef, {
            points: increment(creditPoints),
            lastCreditOrderId: order.id,
          });
        }
        if (productSnap?.exists()) {
          tx.update(productRef, { stock: (productSnap.data().stock || 0) + (current.quantity || 1) });
        }
      });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Không thể cập nhật đơn hàng, thử lại sau.' });
      return;
    } finally {
      setUpdatingOrderId(null);
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
    <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet py-space-2xl">
      <h2 className="text-title-lg font-bold mb-space-xs">Bảng điều khiển Brand — {brand?.brandName}</h2>
      <p className="text-body-md text-on-surface-variant mb-space-xl">
        Đăng sản phẩm mới, sản phẩm sẽ hiển thị công khai trong Cửa hàng ngay lập tức.
      </p>

      <div className="grid lg:grid-cols-[380px_1fr] gap-space-xl">
        {/* Form đăng / sửa sản phẩm */}
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-card p-space-xl shadow-subtle space-y-space-md h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-title-md font-semibold">
              {editingProduct ? `Sửa: ${editingProduct.name}` : 'Đăng sản phẩm mới'}
            </h3>
            {editingProduct && (
              <button type="button" onClick={cancelEdit} className="text-label-md text-on-surface-variant hover:text-primary transition-colors">
                Huỷ sửa
              </button>
            )}
          </div>

          <div>
            <label className="block text-label-md font-semibold mb-1">Tên sản phẩm *</label>
            <input value={form.name} onChange={handleChange('name')} className="w-full h-10 px-space-md bg-surface-container-high rounded-input text-body-sm" />
          </div>

          <div>
            <label className="block text-label-md font-semibold mb-1">Mô tả</label>
            <textarea value={form.description} onChange={handleChange('description')} rows={3} className="w-full px-space-md py-space-xs bg-surface-container-high rounded-input text-body-sm resize-none" />
          </div>

          <div>
            <label className="block text-label-md font-semibold mb-1">Danh mục</label>
            <select value={form.category} onChange={handleChange('category')} className="w-full h-10 px-space-md bg-surface-container-high rounded-input text-body-sm">
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <label className="flex items-start gap-space-sm p-space-sm rounded-input bg-surface-container-low cursor-pointer">
            <input type="checkbox" checked={form.redeemOnly} onChange={handleChange('redeemOnly')} className="mt-1 w-4 h-4 accent-primary" />
            <span>
              <span className="block text-label-md font-semibold">Sản phẩm độc quyền đổi điểm</span>
              <span className="block text-label-sm text-on-surface-variant">
                Không bán bằng tiền, chỉ đổi trọn bằng điểm xanh. Bỏ chọn để bán bình thường — khách được dùng điểm để giảm giá ({DISCOUNT_RULE_TEXT}).
              </span>
            </span>
          </label>

          {form.redeemOnly ? (
            <div>
              <label className="block text-label-md font-semibold mb-1">Giá đổi (điểm xanh) *</label>
              <input type="number" min="1" step="1" value={form.points} onChange={handleChange('points')} className="w-full h-10 px-space-md bg-surface-container-high rounded-input text-body-sm" />
            </div>
          ) : (
            <div>
              <label className="block text-label-md font-semibold mb-1">Giá bán (VNĐ) *</label>
              <input type="number" min="1000" step="1000" value={form.priceVND} onChange={handleChange('priceVND')} className="w-full h-10 px-space-md bg-surface-container-high rounded-input text-body-sm" />
            </div>
          )}

          <div>
            <label className="block text-label-md font-semibold mb-1">Số lượng tồn kho *</label>
            <input type="number" min="0" value={form.stock} onChange={handleChange('stock')} className="w-full h-10 px-space-md bg-surface-container-high rounded-input text-body-sm" />
          </div>

          <div>
            <label className="block text-label-md font-semibold mb-1">
              Ảnh sản phẩm {editingProduct ? '(để trống nếu giữ ảnh cũ)' : '*'}
            </label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-body-sm" />
            {editingProduct && !imageFile && (
              <p className="text-label-sm text-on-surface-variant mt-1">Đang dùng ảnh hiện tại</p>
            )}
          </div>

          {error && <p className="text-body-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full h-11 bg-primary text-on-primary rounded-input font-bold text-label-lg disabled:opacity-60">
            {submitting
              ? (editingProduct ? 'Đang cập nhật...' : 'Đang đăng...')
              : (editingProduct ? 'Cập nhật sản phẩm' : 'Đăng sản phẩm')
            }
          </button>
        </form>

        {/* Danh sách sản phẩm của brand */}
        <div>
          <h3 className="text-title-md font-semibold mb-space-md">Sản phẩm của bạn ({products.length})</h3>
          {products.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Chưa có sản phẩm nào. Đăng sản phẩm đầu tiên ở form bên trái.</p>
          ) : (
            <div className="space-y-space-sm">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-space-md bg-surface-container-lowest rounded-card p-space-md shadow-subtle">
                  <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-nested shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-lg font-semibold truncate">{p.name}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {p.redeemOnly ? `Độc quyền · ${p.points} điểm` : `${(p.priceVND || 0).toLocaleString('vi-VN')}đ`} · Còn {p.stock}
                    </p>
                  </div>
                  <div className="flex gap-space-xs shrink-0">
                    {/* P1-1: Nút sửa sản phẩm */}
                    <button onClick={() => startEdit(p)} className="text-primary hover:text-secondary transition-colors" title="Sửa">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-700 transition-colors" title="Xoá">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Đơn hàng nhận được — P0-2: dropdown cập nhật trạng thái */}
      <div className="mt-space-2xl">
        <h3 className="text-title-md font-semibold mb-space-md">Đơn hàng nhận được ({orders.length})</h3>
        {orders.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">Chưa có đơn hàng nào cho sản phẩm của bạn.</p>
        ) : (
          <div className="space-y-space-sm">
            {orders.map(o => {
              const statusInfo = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.pending;
              const orderType = o.type || 'buy';
              // Đơn chuyển khoản chưa nhận tiền thì chưa được "Hoàn thành" (khớp firestore.rules)
              const awaitingPayment = orderType === 'buy' && (o.paymentMethod || 'COD') !== 'COD' && o.paymentStatus !== 'paid';
              const transitions = (ORDER_STATUS_TRANSITIONS[orderType]?.[o.status] || [])
                .filter(s => !(awaitingPayment && s === 'completed'));

              return (
                <div key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-space-md bg-surface-container-lowest rounded-card p-space-md shadow-subtle">
                  <img src={o.productImage} alt={o.productName} className="w-12 h-12 object-cover rounded-nested shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-lg font-semibold truncate">
                      {o.productName}{o.quantity > 1 ? ` x${o.quantity}` : ''}
                      {o.orderCode && <span className="text-on-surface-variant font-normal"> · #{o.orderCode}</span>}
                    </p>
                    <p className="text-label-sm text-on-surface-variant truncate">
                      {o.buyerName || o.buyerEmail}
                      {o.buyerPhone ? ` · ${o.buyerPhone}` : ''}
                      {o.buyerAddress ? ` · ${o.buyerAddress}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-space-sm shrink-0">
                    <div className="text-right">
                      <p className="text-label-lg font-bold text-primary">
                        {o.type === 'redeem' ? `${o.pointsUsed} điểm` : `${(o.totalVND || 0).toLocaleString('vi-VN')}đ`}
                        {o.type !== 'redeem' && o.pointsUsed > 0 && (
                          <span className="block text-label-sm font-normal text-on-surface-variant">đã giảm {o.pointsUsed} điểm</span>
                        )}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {o.createdAt?.toDate
                          ? o.createdAt.toDate().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                          : 'Vừa xong'}
                      </p>
                    </div>
                    {/* P0-2: Chip trạng thái + dropdown chuyển trạng thái */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        {o.paymentMethod && o.paymentMethod !== 'COD' && (
                          <span className="text-label-sm text-on-surface-variant">
                            {PAYMENT_METHOD_LABEL[o.paymentMethod] || o.paymentMethod}
                          </span>
                        )}
                        {o.paymentStatus && (
                          <Chip variant={(PAYMENT_STATUS_MAP[o.paymentStatus] || PAYMENT_STATUS_MAP.cod).variant}>
                            {(PAYMENT_STATUS_MAP[o.paymentStatus] || PAYMENT_STATUS_MAP.cod).label}
                          </Chip>
                        )}
                        <Chip variant={statusInfo.variant}>{statusInfo.label}</Chip>
                      </div>
                      {o.paymentStatus === 'unpaid' && (
                        <button
                          onClick={() => confirmOrderPayment(o)}
                          className="text-label-sm font-semibold text-primary hover:text-secondary transition-colors"
                        >
                          Xác nhận đã nhận tiền
                        </button>
                      )}
                      {transitions.length > 0 && (
                        <select
                          value=""
                          disabled={updatingOrderId === o.id}
                          onChange={(e) => {
                            if (e.target.value) updateOrderStatus(o, e.target.value);
                          }}
                          className="text-label-sm bg-surface-container-high rounded-input px-space-xs py-0.5 text-on-surface-variant cursor-pointer"
                        >
                          <option value="">Cập nhật →</option>
                          {transitions.map(s => (
                            <option key={s} value={s}>{ORDER_STATUS_MAP[s]?.label || s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
