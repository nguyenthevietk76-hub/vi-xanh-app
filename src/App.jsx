import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Toast from './components/Toast';
import TradeInModal from './components/TradeInModal';
import PurchaseModal from './components/PurchaseModal';
import Home from './pages/Home';
import Store from './pages/Store';
import Project from './pages/Project';
import Wallet from './pages/Wallet';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
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
          <Route path="/du-an" element={<Project />} />
          <Route path="/vi-cua-toi" element={<Wallet />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen flex flex-col bg-surface-container-high font-sans text-body-md text-on-surface antialiased">
          <ScrollToTop />
          <TopNav />
          <main className="flex-1 pt-20 pb-20 md:pb-0">
            <AnimatedRoutes />
          </main>
          <Footer />
          <BottomNav />
          <TradeInModal />
          <PurchaseModal />
          <Toast />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
