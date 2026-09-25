import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useApp } from '../context/AppContext';

// Lấy 1 sản phẩm theo id: sản phẩm demo (mockData) hoặc sản phẩm brand (Firestore, real-time).
// Trả về { product, loading } — product = null nếu không tồn tại.
export function useProduct(productId) {
  const { products: mockProducts } = useApp();
  const mock = productId ? mockProducts.find(p => p.id === productId) : null;
  const [remote, setRemote] = useState({ id: null, product: null });

  useEffect(() => {
    if (!productId || mock) return;
    const unsub = onSnapshot(
      doc(db, 'products', productId),
      (snap) => setRemote({ id: productId, product: snap.exists() ? { id: snap.id, ...snap.data() } : null }),
      () => setRemote({ id: productId, product: null }),
    );
    return unsub;
  }, [productId, Boolean(mock)]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!productId) return { product: null, loading: false };
  if (mock) return { product: mock, loading: false };
  return { product: remote.id === productId ? remote.product : null, loading: remote.id !== productId };
}
