import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/', label: 'Trang chủ', icon: 'home' },
  { path: '/cua-hang', label: 'Cửa hàng', icon: 'storefront' },
  { path: '/du-an', label: 'Dự án', icon: 'eco' },
  { path: '/vi-cua-toi', label: 'Ví của tôi', icon: 'account_balance_wallet' },
];

export default function BottomNav() {
  const { openTradeIn } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* FAB */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          onClick={openTradeIn}
          className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-level-3
                     flex items-center justify-center border-4 border-surface-container-high"
          aria-label="Đổi đồ cũ"
        >
          <span className="material-symbols-outlined text-[24px]">autorenew</span>
        </motion.button>
      </div>

      {/* Nav Bar */}
      <div className="bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 py-1 px-3 min-w-[64px]
                transition-colors duration-200
                ${index === 1 ? 'mr-6' : ''} ${index === 2 ? 'ml-6' : ''}
                ${isActive ? 'text-primary' : 'text-on-surface-variant'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[22px] ${isActive ? 'font-[\'FILL\'_1]' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
