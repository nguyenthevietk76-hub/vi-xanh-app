import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useEffect } from 'react';

export default function Toast() {
  const { toast, hideToast } = useApp();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(hideToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="fixed top-24 right-4 z-[100] max-w-sm"
        >
          <div className={`
            flex items-center gap-space-sm px-space-xl py-space-md rounded-card shadow-level-3
            ${toast.type === 'success' ? 'bg-primary text-on-primary' : 'bg-coral-mist text-coral-mist-text'}
          `}>
            <span className="material-symbols-outlined icon-md">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-body-md font-medium">{toast.message}</span>
            <button onClick={hideToast} className="ml-auto opacity-70 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined icon-sm">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
