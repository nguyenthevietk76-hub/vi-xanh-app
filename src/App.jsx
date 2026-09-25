import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { lazy, Suspense, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Toast from './components/Toast';
import TradeInModal from './components/TradeInModal';
import PurchaseModal from './components/PurchaseModal';
import LoadingFallback from './components/LoadingFallback';
import Home from './pages/Home';

// P0-3: Code-splitting — lazy load các route phụ để giảm bundle chính
const Store = lazy(() => import('./pages/Store'));
const Project = lazy(() => import('./pages/Project'));
const Wallet = lazy(() => import('./pages/Wallet'));
const BrandRegister = lazy(() => import('./pages/BrandRegister'));
const BrandDashboard = lazy(() => import('./pages/BrandDashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/cua-hang" element={<Store />} />
            <Route path="/san-pham/:id" element={<ProductDetail />} />
            <Route path="/gio-hang" element={<Cart />} />
            <Route path="/thanh-toan" element={<Checkout />} />
            <Route path="/du-an" element={<Project />} />
            <Route path="/vi-cua-toi" element={<Wallet />} />
            <Route path="/brand/dang-ky" element={<BrandRegister />} />
            <Route
              path="/brand/dashboard"
              element={<ProtectedRoute require="brand"><BrandDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute require="admin"><AdminPanel /></ProtectedRoute>}
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-surface-container-high font-sans text-body-md text-on-surface antialiased">
              <ScrollToTop />
              <TopNav />
              <main className="flex-1 pt-20 pb-28 md:pb-0">
                <ErrorBoundary>
                  <AnimatedRoutes />
                </ErrorBoundary>
              </main>
              <Footer />
              <BottomNav />
              <TradeInModal />
              <PurchaseModal />
              <Toast />
            </div>
          </CartProvider>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
