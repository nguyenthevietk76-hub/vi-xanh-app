import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { isRedeemOnly } from '../lib/points';
import { useApp } from './AppContext';

/* ══════════════════════════════════════════
   GIỎ HÀNG — lưu lâu dài
   - Đã đăng nhập: Firestore carts/{uid}/items/{productId}  (đồng bộ mọi thiết bị)
   - Chưa đăng nhập: localStorage, tự gộp vào Firestore khi đăng nhập
   Giỏ chỉ lưu { productId, qty }. Giá, tồn kho, tên... luôn đọc trực tiếp
   từ sản phẩm (real-time) để không bao giờ hiển thị giá cũ.
   ══════════════════════════════════════════ */

const GUEST_KEY = 'vx_guest_cart';
export const MAX_CART_QTY = 99;

const CartContext = createContext(null);

// Gom các dòng giỏ theo shop (brand); sản phẩm demo thuộc shop "Ví Xanh"
export function groupByShop(items) {
  const groups = new Map();
  items.forEach(item => {
    const key = item.product?.brandId || 'vi-xanh';
    if (!groups.has(key)) groups.set(key, { key, name: item.product?.brandName || 'Ví Xanh', items: [] });
    groups.get(key).items.push(item);
  });
  return [...groups.values()];
}

function readGuestCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(i => i && typeof i.productId === 'string' && i.qty > 0) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    // Trình duyệt chặn lưu trữ — giỏ vẫn chạy trong phiên hiện tại
  }
}

function clampQty(qty, stock) {
  const max = Math.min(MAX_CART_QTY, typeof stock === 'number' ? stock : MAX_CART_QTY);
  return Math.max(1, Math.min(Math.floor(qty) || 1, Math.max(1, max)));
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { products: mockProducts, showToast } = useApp();

  const [entries, setEntries] = useState(() => (user ? [] : readGuestCart())); // [{ productId, qty }]
  const [liveProducts, setLiveProducts] = useState({}); // productId → dữ liệu Firestore (null = đã xoá)
  const [loaded, setLoaded] = useState(!user);
  const mergedFor = useRef(null);

  // ── Nguồn dữ liệu giỏ: Firestore (đăng nhập) hoặc localStorage (khách) ──
  useEffect(() => {
    if (!user) {
      mergedFor.current = null;
      setEntries(readGuestCart());
      setLoaded(true);
      return;
    }

    setLoaded(false);
    const itemsCol = collection(db, 'carts', user.uid, 'items');

    // Lần đầu đăng nhập trong phiên: gộp giỏ của khách vào giỏ tài khoản
    const mergeGuest = async () => {
      if (mergedFor.current === user.uid) return;
      mergedFor.current = user.uid;
      const guest = readGuestCart();
      if (guest.length === 0) return;
      try {
        const existing = await getDocs(itemsCol);
        const current = Object.fromEntries(existing.docs.map(d => [d.id, d.data().qty || 0]));
        const batch = writeBatch(db);
        guest.forEach(g => {
          batch.set(doc(itemsCol, g.productId), {
            productId: g.productId,
            qty: clampQty((current[g.productId] || 0) + g.qty),
            addedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        writeGuestCart([]);
      } catch (err) {
        console.warn('Không thể gộp giỏ hàng khách:', err);
      }
    };
    mergeGuest();

    const unsub = onSnapshot(itemsCol, (snap) => {
      const list = snap.docs
        .map(d => ({ productId: d.id, qty: d.data().qty || 1, addedAt: d.data().addedAt?.toMillis?.() || Date.now() }))
        .sort((a, b) => b.addedAt - a.addedAt);
      setEntries(list);
      setLoaded(true);
    }, (err) => {
      console.warn('Không thể tải giỏ hàng:', err);
      setLoaded(true);
    });
    return unsub;
  }, [user]);

  // ── Theo dõi real-time các sản phẩm thật có trong giỏ ──
  const mockIds = useMemo(() => new Set(mockProducts.map(p => p.id)), [mockProducts]);
  const realIdsKey = entries.filter(e => !mockIds.has(e.productId)).map(e => e.productId).sort().join(',');

  useEffect(() => {
    const ids = realIdsKey ? realIdsKey.split(',') : [];
    const unsubs = ids.map(id => onSnapshot(doc(db, 'products', id), (snap) => {
      setLiveProducts(prev => ({ ...prev, [id]: snap.exists() ? { id: snap.id, ...snap.data() } : null }));
    }, () => {
      setLiveProducts(prev => ({ ...prev, [id]: null }));
    }));
    return () => unsubs.forEach(u => u());
  }, [realIdsKey]);

  // ── Ghép giỏ với dữ liệu sản phẩm hiện tại ──
  const items = useMemo(() => entries.map(e => {
    const product = mockIds.has(e.productId)
      ? mockProducts.find(p => p.id === e.productId)
      : liveProducts[e.productId];
    const loading = !mockIds.has(e.productId) && !(e.productId in liveProducts);
    // Sản phẩm đã chuyển sang "độc quyền đổi điểm" thì không mua được nữa
    const unavailable = !loading && (!product || product.status === 'inactive' || (product.stock ?? 0) <= 0 || isRedeemOnly(product));
    return { ...e, product: product || null, loading, unavailable };
  }), [entries, liveProducts, mockProducts, mockIds]);

  const count = useMemo(() => entries.reduce((s, e) => s + e.qty, 0), [entries]);

  // ── Thao tác ──
  const persist = useCallback(async (productId, qty) => {
    if (user) {
      const ref = doc(db, 'carts', user.uid, 'items', productId);
      const isNew = !entries.some(e => e.productId === productId);
      if (qty <= 0) await deleteDoc(ref);
      // Chỉ đặt addedAt khi thêm mới để thứ tự trong giỏ không nhảy khi đổi số lượng
      else await setDoc(ref, isNew ? { productId, qty, addedAt: serverTimestamp() } : { productId, qty }, { merge: true });
    } else {
      setEntries(prev => {
        const others = prev.filter(e => e.productId !== productId);
        const existing = prev.find(e => e.productId === productId);
        const next = qty <= 0
          ? others
          : existing
            ? prev.map(e => (e.productId === productId ? { ...e, qty } : e))
            : [{ productId, qty, addedAt: Date.now() }, ...others];
        writeGuestCart(next);
        return next;
      });
    }
  }, [user, entries]);

  const addToCart = useCallback(async (product, qty = 1) => {
    if (!product?.id) return false;
    if (isRedeemOnly(product)) {
      showToast({ type: 'error', message: 'Sản phẩm độc quyền chỉ đổi bằng điểm xanh, không thêm vào giỏ hàng.' });
      return false;
    }
    if (user && product.brandId === user.uid) {
      showToast({ type: 'error', message: 'Bạn không thể mua sản phẩm của chính brand mình.' });
      return false;
    }
    if (typeof product.stock === 'number' && product.stock <= 0) {
      showToast({ type: 'error', message: 'Sản phẩm đã hết hàng.' });
      return false;
    }
    const current = entries.find(e => e.productId === product.id)?.qty || 0;
    const nextQty = clampQty(current + qty, product.stock);
    if (nextQty === current) {
      showToast({ type: 'error', message: `Giỏ đã có tối đa số lượng còn trong kho (${current}).` });
      return false;
    }
    try {
      await persist(product.id, nextQty);
      showToast({ type: 'success', message: `Đã thêm "${product.name}" vào giỏ hàng.` });
      return true;
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Không thể thêm vào giỏ, thử lại sau.' });
      return false;
    }
  }, [entries, persist, showToast, user]);

  const setQty = useCallback(async (productId, qty, stock) => {
    try {
      await persist(productId, clampQty(qty, stock));
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Không thể cập nhật giỏ hàng.' });
    }
  }, [persist, showToast]);

  const removeFromCart = useCallback(async (productIds) => {
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    try {
      if (user) {
        const batch = writeBatch(db);
        ids.forEach(id => batch.delete(doc(db, 'carts', user.uid, 'items', id)));
        await batch.commit();
      } else {
        setEntries(prev => {
          const next = prev.filter(e => !ids.includes(e.productId));
          writeGuestCart(next);
          return next;
        });
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Không thể xoá khỏi giỏ hàng.' });
    }
  }, [user, showToast]);

  const value = { items, count, loaded, addToCart, setQty, removeFromCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
