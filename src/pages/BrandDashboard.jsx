import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, updateDoc, doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Chip from '../components/Chip';
import { vndToPoints } from '../lib/points';

const CATEGORY_OPTIONS = ['Bình nước', 'Túi vải', 'Đồ gia dụng', 'Cây xanh', 'Khác'];

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
  const [form, setForm] = useState({
    name: '', description: '', category: CATEGORY_OPTIONS[0],
    priceVND: '', points: '', stock: '',
  });
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

  // Giá đổi điểm luôn = giá VNĐ ÷ 1.000 (1 điểm ≈ 1.000đ) — tự tính khi nhập giá
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm(f => field === 'priceVND'
      ? { ...f, priceVND: value, points: value ? String(vndToPoints(value)) : '' }
      : { ...f, [field]: value });
  };

  // P1-1: Bấm "Sửa" → prefill form
  const startEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category || CATEGORY_OPTIONS[0],
      priceVND: String(product.priceVND || ''),
      points: product.priceVND ? String(vndToPoints(product.priceVND)) : '',
      stock: String(product.stock || ''),
    });
    setImageFile(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', category: CATEGORY_OPTIONS[0], priceVND: '', points: '', stock: '' });
    setImageFile(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.priceVND || !form.stock) {
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

      if (editingProduct) {
        // P1-1: Cập nhật sản phẩm hiện có
        await updateDoc(doc(db, 'products', editingProduct.id), {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          priceVND: Number(form.priceVND),
          points: vndToPoints(form.priceVND),
          stock: Number(form.stock),
          image: imageURL,
        });
        cancelEdit();
      } else {
        // Tạo sản phẩm mới
        await addDoc(collection(db, 'products'), {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          priceVND: Number(form.priceVND),
          points: vndToPoints(form.priceVND),
          stock: Number(form.stock),
          image: imageURL,
          rating: 5,
          reviews: 0,
          weeklyRedeemed: 0,
          badge: 'new',
          isNew: true,
          brandId: user.uid,
          brandName: brand?.brandName || '',
          status: 'active',
          createdAt: serverTimestamp(),
        });
        setForm({ name: '', description: '', category: CATEGORY_OPTIONS[0], priceVND: '', points: '', stock: '' });
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
  //  - Đơn đổi điểm "Đã huỷ" → hoàn lại điểm (pointsUsed) cho người mua
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

          <div className="grid grid-cols-2 gap-space-sm">
            <div>
              <label className="block text-label-md font-semibold mb-1">Giá (VNĐ) *</label>
              <input type="number" min="0" value={form.priceVND} onChange={handleChange('priceVND')} className="w-full h-10 px-space-md bg-surface-container-high rounded-input text-body-sm" />
            </div>
            <div>
              <label className="block text-label-md font-semibold mb-1">Điểm xanh (tự tính)</label>
              <input type="number" value={form.points} readOnly tabIndex={-1} title="Tự tính: giá VNĐ ÷ 1.000" className="w-full h-10 px-space-md bg-surface-container-low rounded-input text-body-sm text-on-surface-variant cursor-not-allowed" />
            </div>
          </div>

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
                      {p.priceVND?.toLocaleString('vi-VN')}đ · {p.points} điểm · Còn {p.stock}
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
