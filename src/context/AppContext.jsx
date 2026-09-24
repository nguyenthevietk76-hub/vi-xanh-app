import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_IMPACT, VOUCHERS, MILESTONES } from '../data/mockData';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, runTransaction, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { generateOrderCode } from '../lib/vietqr';
import { pointsToVND, calcBonusPoints, calcTradeInPoints, calcCo2Saved, getTradeInRate } from '../lib/points';

// ── Initial State ──
const initialState = {
  user: {
    name: 'Nguyễn Minh Anh',
    memberId: 'VX-9942',
    memberTier: 'Hạng Bạc',
  },
  wallet: {
    points: 324,
    equivalentVND: pointsToVND(324),
  },
  transactions: INITIAL_TRANSACTIONS,
  products: PRODUCTS,
  cart: [],
  impact: INITIAL_IMPACT,
  vouchers: VOUCHERS,
  milestones: MILESTONES,
  tradeInModalOpen: false,
  purchaseModalProduct: null,
  toast: null,
};

// ── Action Types ──
const ACTIONS = {
  TRADE_IN: 'TRADE_IN',
  REDEEM_PRODUCT: 'REDEEM_PRODUCT',
  BUY_PRODUCT: 'BUY_PRODUCT',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  OPEN_TRADE_IN: 'OPEN_TRADE_IN',
  CLOSE_TRADE_IN: 'CLOSE_TRADE_IN',
  OPEN_PURCHASE_MODAL: 'OPEN_PURCHASE_MODAL',
  CLOSE_PURCHASE_MODAL: 'CLOSE_PURCHASE_MODAL',
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST',
};

// ── Reducer ──
function appReducer(state, action) {
  switch (action.type) {
    // Chế độ demo (chưa đăng nhập): cộng điểm vào ví mẫu để trải nghiệm luồng.
    // Người dùng thật đi qua yêu cầu thu gom → admin cân & duyệt (xem tradeIn bên dưới).
    case ACTIONS.TRADE_IN: {
      const { category, weight, points, co2Saved } = action.payload;
      const newTransaction = {
        id: `t${Date.now()}`,
        type: 'trade-in',
        desc: `Đổi ${weight}kg ${category} – Điểm thu gom`,
        points: points,
        date: new Date().toISOString(),
        category: category,
        weight: weight,
      };
      return {
        ...state,
        wallet: {
          ...state.wallet,
          points: state.wallet.points + points,
          equivalentVND: pointsToVND(state.wallet.points + points),
        },
        transactions: [newTransaction, ...state.transactions],
        impact: {
          ...state.impact,
          totalKgRecycled: state.impact.totalKgRecycled + weight,
          co2SavedKg: state.impact.co2SavedKg + co2Saved,
        },
        tradeInModalOpen: false,
        toast: {
          type: 'success',
          message: `+${points} điểm xanh (demo) đã được cộng vào ví! Đăng nhập để gửi yêu cầu thu gom thật.`,
        },
      };
    }

    case ACTIONS.REDEEM_PRODUCT: {
      // payload: { product, real } — real = đã ghi Firestore, ví hiển thị lấy từ Firestore
      const { product, real = false } = action.payload;
      if (!real && state.wallet.points < product.points) return state;
      const newTransaction = {
        id: `t${Date.now()}`,
        type: 'redeem',
        desc: `Đổi ${product.name} – Đơn hàng #${action.payload.orderCode || `VX-${Math.floor(Math.random() * 9000 + 1000)}`}`,
        points: -product.points,
        date: new Date().toISOString(),
        productId: product.id,
      };
      const updatedProducts = state.products.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1, weeklyRedeemed: p.weeklyRedeemed + 1 } : p
      );
      return {
        ...state,
        wallet: real ? state.wallet : {
          ...state.wallet,
          points: state.wallet.points - product.points,
          equivalentVND: pointsToVND(state.wallet.points - product.points),
        },
        transactions: [newTransaction, ...state.transactions],
        products: updatedProducts,
        toast: {
          type: 'success',
          message: `Đổi thành công "${product.name}"!`,
        },
      };
    }

    case ACTIONS.ADD_TO_CART: {
      const existing = state.cart.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, qty: 1 }],
        toast: {
          type: 'success',
          message: `"${action.payload.name}" đã thêm vào giỏ!`,
        },
      };
    }

    case ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };

    case ACTIONS.OPEN_PURCHASE_MODAL:
      return { ...state, purchaseModalProduct: action.payload };

    case ACTIONS.CLOSE_PURCHASE_MODAL:
      return { ...state, purchaseModalProduct: null };

    case ACTIONS.BUY_PRODUCT: {
      // Chế độ demo (sản phẩm mẫu): cộng thưởng ngay vào ví mẫu
      const { product, quantity = 1, customerInfo = {}, paymentMethod = 'COD', orderCode } = action.payload;
      const totalVND = (product.priceVND || 0) * quantity;
      const bonusPoints = calcBonusPoints(totalVND);
      const newTransaction = {
        id: `t${Date.now()}`,
        type: 'buy',
        desc: `Mua ${product.name} (x${quantity}) – Đơn hàng #${orderCode}`,
        points: bonusPoints,
        date: new Date().toISOString(),
        productId: product.id,
        amountVND: totalVND,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'cod' : 'unpaid',
        orderCode,
        customerName: customerInfo.name,
      };
      const updatedProducts = state.products.map(p =>
        p.id === product.id ? { ...p, stock: Math.max(0, p.stock - quantity), weeklyRedeemed: p.weeklyRedeemed + quantity } : p
      );
      return {
        ...state,
        wallet: {
          ...state.wallet,
          points: state.wallet.points + bonusPoints,
          equivalentVND: pointsToVND(state.wallet.points + bonusPoints),
        },
        products: updatedProducts,
        transactions: [newTransaction, ...state.transactions],
        // Modal đóng hay chuyển sang bước hiển thị QR do PurchaseModal tự quyết định,
        // không tự đóng ở đây nữa (đơn hàng VietQR cần giữ modal để hiện mã QR).
        toast: {
          type: 'success',
          message:
            paymentMethod === 'COD'
              ? `Đặt mua thành công "${product.name}"! +${bonusPoints} điểm xanh đã cộng vào ví.`
              : `Đã tạo đơn "${product.name}"! Hoàn tất chuyển khoản để người bán xác nhận đơn.`,
        },
      };
    }

    case ACTIONS.OPEN_TRADE_IN:
      return { ...state, tradeInModalOpen: true };

    case ACTIONS.CLOSE_TRADE_IN:
      return { ...state, tradeInModalOpen: false };

    case ACTIONS.SHOW_TOAST:
      return { ...state, toast: action.payload };

    case ACTIONS.HIDE_TOAST:
      return { ...state, toast: null };

    default:
      return state;
  }
}

// ── Context ──
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, userPoints } = useAuth();

  // P0-1: Nếu user đã đăng nhập, wallet.points lấy từ Firestore real-time;
  // nếu chưa đăng nhập, giữ mock points 3240 cho trải nghiệm demo.
  const walletWithRealPoints = useMemo(() => {
    if (user && userPoints !== null) {
      return {
        points: userPoints,
        equivalentVND: pointsToVND(userPoints),
      };
    }
    return state.wallet;
  }, [user, userPoints, state.wallet]);

  // Đổi đồ cũ lấy điểm.
  // - Chưa đăng nhập: demo cục bộ (cộng vào ví mẫu).
  // - Đã đăng nhập: tạo yêu cầu thu gom 'pending'. Điểm KHÔNG cộng ngay —
  //   admin/điểm thu gom cân thực tế rồi duyệt trong AdminPanel mới cộng.
  // Trả về true nếu thành công để modal reset/đóng.
  const tradeIn = useCallback(async ({ categoryId, weight, collectionPoint }) => {
    const rate = getTradeInRate(categoryId);
    if (!rate) return false;
    const points = calcTradeInPoints(categoryId, weight);
    const co2Saved = calcCo2Saved(categoryId, weight);

    if (!user) {
      dispatch({ type: ACTIONS.TRADE_IN, payload: { category: rate.shortName, weight, points, co2Saved } });
      return true;
    }

    try {
      await addDoc(collection(db, 'tradeIns'), {
        userId: user.uid,
        userName: user.displayName || '',
        userEmail: user.email || '',
        categoryId,
        declaredWeightKg: weight,
        estimatedPoints: points,
        collectionPoint: collectionPoint || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      dispatch({ type: ACTIONS.CLOSE_TRADE_IN });
      dispatch({
        type: ACTIONS.SHOW_TOAST,
        payload: {
          type: 'success',
          message: `Đã gửi yêu cầu thu gom ${weight}kg ${rate.shortName.toLowerCase()}. Khoảng +${points} điểm sẽ được cộng sau khi điểm thu gom cân và xác nhận.`,
        },
      });
      return true;
    } catch (err) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: err.message || 'Gửi yêu cầu thu gom thất bại, thử lại sau.' } });
      return false;
    }
  }, [user]);

  const redeemProduct = useCallback(async (product) => {
    // Sản phẩm demo (không có brandId) — giữ nguyên hành vi cũ, chỉ xử lý cục bộ
    if (!product.brandId) {
      dispatch({ type: ACTIONS.REDEEM_PRODUCT, payload: { product } });
      return;
    }

    if (!user) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: 'Vui lòng đăng nhập để đổi sản phẩm này.' } });
      return;
    }

    // firestore.rules chặn brand tự đổi sản phẩm của chính mình
    if (product.brandId === user.uid) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: 'Bạn không thể đổi sản phẩm của chính brand mình.' } });
      return;
    }

    try {
      // Tạo sẵn ID đơn để ghi trong CÙNG transaction với trừ kho + trừ điểm.
      // firestore.rules kiểm tra 3 thao tác này đi cùng nhau và khớp số liệu
      // (điểm trừ = đúng giá điểm của sản phẩm, kho trừ = đúng số lượng đơn).
      const orderRef = doc(collection(db, 'orders'));
      const orderCode = generateOrderCode();
      let finalProduct = product;

      await runTransaction(db, async (tx) => {
        const productRef = doc(db, 'products', product.id);
        const userRef = doc(db, 'users', user.uid);
        const productSnap = await tx.get(productRef);
        const userSnap = await tx.get(userRef);

        if (!productSnap.exists()) throw new Error('Sản phẩm không còn tồn tại.');
        if (!userSnap.exists()) throw new Error('Tài khoản không hợp lệ.');

        const productData = productSnap.data();
        const currentPoints = userSnap.data().points || 0;
        const cost = productData.points; // giá điểm lấy từ server, không tin dữ liệu client

        if (currentPoints < cost) throw new Error(`Bạn cần thêm ${cost - currentPoints} điểm nữa để đổi sản phẩm này.`);
        if ((productData.stock || 0) < 1) throw new Error('Sản phẩm đã hết hàng.');

        tx.update(productRef, {
          stock: productData.stock - 1,
          weeklyRedeemed: (productData.weeklyRedeemed || 0) + 1,
          lastOrderId: orderRef.id,
        });
        tx.update(userRef, {
          points: currentPoints - cost,
          lastOrderId: orderRef.id,
        });
        // P0-2: Đơn mới tạo có status 'pending'
        tx.set(orderRef, {
          buyerId: user.uid,
          buyerEmail: user.email || '',
          buyerName: user.displayName || '',
          productId: product.id,
          productName: productData.name || product.name,
          productImage: productData.image || product.image || '',
          brandId: productData.brandId,
          brandName: productData.brandName || '',
          quantity: 1,
          pointsUsed: cost,
          orderCode,
          type: 'redeem',
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        finalProduct = { ...product, points: cost };
      });

      // P1-3: Thông báo cho brand có đơn đổi điểm mới
      try {
        await addDoc(collection(db, 'notifications', product.brandId, 'items'), {
          type: 'order',
          title: 'Đơn đổi điểm mới!',
          message: `${user.displayName || 'Khách hàng'} vừa đổi 1 x "${product.name}".`,
          link: '/brand/dashboard',
          fromUid: user.uid,
          orderId: orderRef.id,
          readAt: null,
          createdAt: serverTimestamp(),
        });
      } catch (errNotif) {
        console.warn('Không thể tạo thông báo đổi điểm:', errNotif);
      }

      // Cập nhật UI cục bộ (toast, lịch sử); ví hiển thị lấy từ Firestore
      dispatch({ type: ACTIONS.REDEEM_PRODUCT, payload: { product: finalProduct, real: true, orderCode } });
    } catch (err) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: err.message || 'Đổi sản phẩm thất bại, thử lại sau.' } });
    }
  }, [user]);

  const buyProduct = useCallback(async (payload) => {
    const { product, quantity = 1, customerInfo = {}, paymentMethod = 'COD' } = payload;
    // Mã đơn ngắn dùng làm nội dung chuyển khoản (đối chiếu với mã QR VietQR)
    const orderCode = generateOrderCode();
    const payloadWithCode = { ...payload, orderCode };

    // Sản phẩm demo (không có brandId) — giữ nguyên hành vi cũ, chỉ xử lý cục bộ
    if (!product.brandId) {
      dispatch({ type: ACTIONS.BUY_PRODUCT, payload: payloadWithCode });
      return { orderCode, totalVND: (product.priceVND || 0) * quantity };
    }

    if (!user) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: 'Vui lòng đăng nhập để đặt mua sản phẩm này.' } });
      return null;
    }

    // firestore.rules chặn brand tự mua sản phẩm của chính mình
    if (product.brandId === user.uid) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: 'Bạn không thể mua sản phẩm của chính brand mình.' } });
      return null;
    }

    try {
      const orderRef = doc(collection(db, 'orders'));
      let totalVND = 0;
      let bonusPoints = 0;

      // Trừ kho + tạo đơn trong cùng transaction. Giá lấy từ server;
      // điểm thưởng được brand cộng khi đơn "Hoàn thành" (không cộng lúc đặt).
      await runTransaction(db, async (tx) => {
        const productRef = doc(db, 'products', product.id);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists()) throw new Error('Sản phẩm không còn tồn tại.');

        const productData = productSnap.data();
        if ((productData.stock || 0) < quantity) throw new Error(`Chỉ còn ${productData.stock || 0} sản phẩm trong kho.`);

        const priceVND = productData.priceVND || 0;
        totalVND = priceVND * quantity;
        bonusPoints = calcBonusPoints(totalVND);

        tx.update(productRef, {
          stock: productData.stock - quantity,
          weeklyRedeemed: (productData.weeklyRedeemed || 0) + quantity,
          lastOrderId: orderRef.id,
        });
        // paymentStatus: 'cod' = trả khi nhận hàng, 'unpaid' = chờ khách chuyển khoản (VietQR/MoMo)
        tx.set(orderRef, {
          buyerId: user.uid,
          buyerEmail: user.email || '',
          buyerName: customerInfo.name || user.displayName || '',
          buyerPhone: customerInfo.phone || '',
          buyerAddress: customerInfo.address || '',
          productId: product.id,
          productName: productData.name || product.name,
          productImage: productData.image || product.image || '',
          brandId: productData.brandId,
          brandName: productData.brandName || '',
          quantity,
          priceVND,
          totalVND,
          pointsEarned: bonusPoints,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'cod' : 'unpaid',
          orderCode,
          type: 'buy',
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      });

      // P1-3: Thông báo cho brand có đơn mua hàng mới
      try {
        await addDoc(collection(db, 'notifications', product.brandId, 'items'), {
          type: 'order',
          title: 'Đơn hàng mới!',
          message: `${customerInfo.name || user.displayName || 'Khách hàng'} vừa đặt mua ${quantity} x "${product.name}".`,
          link: '/brand/dashboard',
          fromUid: user.uid,
          orderId: orderRef.id,
          readAt: null,
          createdAt: serverTimestamp(),
        });
      } catch (errNotif) {
        console.warn('Không thể tạo thông báo đơn hàng mới:', errNotif);
      }

      const bonusText = bonusPoints > 0 ? ` +${bonusPoints} điểm xanh sẽ được cộng khi đơn hoàn tất.` : '';
      dispatch({
        type: ACTIONS.SHOW_TOAST,
        payload: {
          type: 'success',
          message: paymentMethod === 'COD'
            ? `Đặt mua thành công "${product.name}"!${bonusText}`
            : `Đã tạo đơn "${product.name}"! Hoàn tất chuyển khoản để người bán xác nhận đơn.`,
        },
      });
      return { orderCode, totalVND };
    } catch (err) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: err.message || 'Đặt mua thất bại, thử lại sau.' } });
      return null;
    }
  }, [user]);

  // Brand xác nhận đã nhận được chuyển khoản cho 1 đơn VietQR/MoMo (chỉ đổi field paymentStatus)
  const confirmOrderPayment = useCallback(async (order) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), { paymentStatus: 'paid' });
    } catch (err) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { type: 'error', message: err.message || 'Không thể xác nhận thanh toán, thử lại sau.' } });
    }
  }, []);

  const openPurchaseModal = useCallback((product) => {
    dispatch({ type: ACTIONS.OPEN_PURCHASE_MODAL, payload: product });
  }, []);

  const closePurchaseModal = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_PURCHASE_MODAL });
  }, []);

  const addToCart = useCallback((product) => {
    dispatch({ type: ACTIONS.ADD_TO_CART, payload: product });
  }, []);

  const removeFromCart = useCallback((productId) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: productId });
  }, []);

  const openTradeIn = useCallback(() => {
    dispatch({ type: ACTIONS.OPEN_TRADE_IN });
  }, []);

  const closeTradeIn = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_TRADE_IN });
  }, []);

  const showToast = useCallback((toast) => {
    dispatch({ type: ACTIONS.SHOW_TOAST, payload: toast });
    setTimeout(() => dispatch({ type: ACTIONS.HIDE_TOAST }), 4000);
  }, []);

  const hideToast = useCallback(() => {
    dispatch({ type: ACTIONS.HIDE_TOAST });
  }, []);

  const value = {
    ...state,
    wallet: walletWithRealPoints, // P0-1: điểm thật khi đăng nhập, mock khi chưa
    tradeIn,
    redeemProduct,
    buyProduct,
    confirmOrderPayment,
    openPurchaseModal,
    closePurchaseModal,
    addToCart,
    removeFromCart,
    openTradeIn,
    closeTradeIn,
    showToast,
    hideToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default AppContext;
