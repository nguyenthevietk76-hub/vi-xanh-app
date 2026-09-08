import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

const AuthContext = createContext(null);

// Điểm chào mừng cho user mới đăng ký lần đầu (đủ để thử đổi 1 sản phẩm nhỏ)
const WELCOME_POINTS = 500;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // Firebase Auth user object
  const [brand, setBrand] = useState(null); // brands/{uid} doc, hoặc null nếu chưa đăng ký
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // P0-1: Điểm thật từ Firestore, real-time qua onSnapshot
  const [userPoints, setUserPoints] = useState(null); // null = chưa load / chưa đăng nhập

  useEffect(() => {
    let unsubBrand = () => {};
    let unsubAdmin = () => {};
    let unsubUserDoc = () => {};

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubBrand();
      unsubAdmin();
      unsubUserDoc();

      if (!firebaseUser) {
        setUser(null);
        setBrand(null);
        setIsAdmin(false);
        setUserPoints(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      // Tạo hồ sơ users/{uid} nếu đây là lần đăng nhập đầu tiên
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          points: WELCOME_POINTS, // P0-1: Khởi tạo điểm chào mừng
          createdAt: serverTimestamp(),
        });
      }

      // P0-1: Theo dõi real-time điểm xanh từ users/{uid}.points
      unsubUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserPoints(typeof data.points === 'number' ? data.points : 0);
        }
      });

      // Theo dõi real-time hồ sơ brand (nếu có) — tự cập nhật khi admin duyệt
      unsubBrand = onSnapshot(doc(db, 'brands', firebaseUser.uid), (snap) => {
        setBrand(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      });

      // Là admin nếu tồn tại document admins/{uid} (tạo thủ công trong Firebase Console)
      unsubAdmin = onSnapshot(doc(db, 'admins', firebaseUser.uid), (snap) => {
        setIsAdmin(snap.exists());
      });

      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubBrand();
      unsubAdmin();
      unsubUserDoc();
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const submitBrandApplication = useCallback(async ({ brandName, description }) => {
    if (!user) throw new Error('Bạn cần đăng nhập trước.');
    await setDoc(doc(db, 'brands', user.uid), {
      brandName,
      description,
      ownerUid: user.uid,
      ownerEmail: user.email,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }, [user]);

  const value = {
    user,
    brand, // null | { status: 'pending' | 'approved' | 'rejected', brandName, description, ... }
    isBrandApproved: brand?.status === 'approved',
    isAdmin,
    loading,
    userPoints, // P0-1: số điểm thật từ Firestore (null nếu chưa đăng nhập)
    loginWithGoogle,
    logout,
    submitBrandApplication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
