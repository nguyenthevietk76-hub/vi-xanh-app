import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { WalletBadge } from './WalletPointCounter';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/cua-hang', label: 'Cửa hàng' },
  { path: '/du-an', label: 'Dự án' },
  { path: '/vi-cua-toi', label: 'Ví của tôi' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const { cart } = useApp();
  const cartItemCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="h-20 max-w-content mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="shrink-0">
          <Logo />
        </NavLink>

        {/* Nav Links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-space-xl">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `text-label-lg font-semibold pb-1 border-b-2 transition-colors duration-200 ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-on-surface'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Wallet + Cart + Avatar */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          <div className="hidden sm:block">
            <WalletBadge onClick={() => navigate('/vi-cua-toi')} />
          </div>

          {/* Cart Button */}
          <button
            onClick={() => navigate('/cua-hang')}
            className="relative w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-center hover:bg-surface-container-low transition-colors text-primary"
            title="Giỏ hàng"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-sunlit-ochre text-sunlit-ochre-text font-bold text-[10px] flex items-center justify-center border-2 border-surface-container-lowest">
                {cartItemCount}
              </span>
            )}
          </button>

          <button className="hidden sm:inline-flex items-center justify-center px-space-lg py-space-xs bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container-low rounded-chip text-label-lg font-semibold transition-all shadow-subtle">
            Đăng nhập
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
