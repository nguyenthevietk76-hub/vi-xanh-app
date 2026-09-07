import { createContext, useContext, useReducer, useCallback } from 'react';
import { PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_IMPACT, VOUCHERS, MILESTONES } from '../data/mockData';

// ── Initial State ──
const initialState = {
  user: {
    name: 'Nguyễn Minh Anh',
    memberId: 'VX-9942',
    memberTier: 'Hạng Bạc',
  },
  wallet: {
    points: 3240,
    equivalentVND: 450000,
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
    case ACTIONS.TRADE_IN: {
      const { category, weight, condition, points, co2Saved } = action.payload;
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
          equivalentVND: Math.round((state.wallet.points + points) / 450 * 100) * 1000,
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
          message: `+${points} điểm xanh đã được cộng vào ví!`,
        },
      };
    }

    case ACTIONS.REDEEM_PRODUCT: {
      const product = action.payload;
      if (state.wallet.points < product.points) return state;
      const newTransaction = {
        id: `t${Date.now()}`,
        type: 'redeem',
        desc: `Đổi ${product.name} – Đơn hàng #VX-${Math.floor(Math.random() * 9000 + 1000)}`,
        points: -product.points,
        date: new Date().toISOString(),
        productId: product.id,
      };
      const updatedProducts = state.products.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1, weeklyRedeemed: p.weeklyRedeemed + 1 } : p
      );
      return {
        ...state,
        wallet: {
          ...state.wallet,
          points: state.wallet.points - product.points,
          equivalentVND: Math.round((state.wallet.points - product.points) / 450 * 100) * 1000,
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
      const { product, quantity = 1, customerInfo = {}, paymentMethod = 'COD', bonusPoints = 50 } = action.payload;
      const orderId = Math.floor(Math.random() * 9000 + 1000);
      const totalVND = (product.priceVND || 0) * quantity;
      const newTransaction = {
        id: `t${Date.now()}`,
        type: 'buy',
        desc: `Mua ${product.name} (x${quantity}) – Đơn hàng #VX-${orderId}`,
        points: bonusPoints,
        date: new Date().toISOString(),
        productId: product.id,
        amountVND: totalVND,
        paymentMethod: paymentMethod,
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
          equivalentVND: Math.round((state.wallet.points + bonusPoints) / 450 * 100) * 1000,
        },
        products: updatedProducts,
        transactions: [newTransaction, ...state.transactions],
        purchaseModalProduct: null,
        toast: {
          type: 'success',
          message: `Đặt mua thành công "${product.name}"! +${bonusPoints} điểm xanh đã cộng vào ví.`,
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

  const tradeIn = useCallback((payload) => {
    dispatch({ type: ACTIONS.TRADE_IN, payload });
  }, []);

  const redeemProduct = useCallback((product) => {
    dispatch({ type: ACTIONS.REDEEM_PRODUCT, payload: product });
  }, []);

  const buyProduct = useCallback((payload) => {
    dispatch({ type: ACTIONS.BUY_PRODUCT, payload });
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
    tradeIn,
    redeemProduct,
    buyProduct,
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
