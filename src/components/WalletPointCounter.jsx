import { useApp } from '../context/AppContext';
import CountUp from './CountUp';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export function WalletBadge({ onClick }) {
  const { wallet } = useApp();
  const prevPoints = useRef(wallet.points);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (wallet.points !== prevPoints.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
      prevPoints.current = wallet.points;
    }
  }, [wallet.points]);

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`
        inline-flex items-center gap-1 sm:gap-space-xs px-2 sm:px-space-md py-1 sm:py-1.5
        rounded-chip text-label-sm sm:text-label-lg font-semibold
        transition-all duration-300 shrink-0
        ${flash
          ? 'bg-secondary-container text-primary ring-2 ring-secondary-container'
          : 'bg-surface-container-low text-primary hover:bg-surface-container'
        }
      `}
      title="Xem ví của tôi"
    >
      <span className="material-symbols-outlined text-[17px] sm:icon-sm text-secondary">eco</span>
      <span className="hidden xs:inline">Số dư: </span>
      <span className="font-bold">{wallet.points.toLocaleString('vi-VN')}</span>
      <span className="hidden md:inline text-on-surface-variant font-normal"> điểm xanh</span>
    </motion.button>
  );
}

// ── Full variant (Wallet page hero / Home page widget) ──
export default function WalletPointCounter({ variant = 'full', className = '' }) {
  const { wallet, impact } = useApp();

  if (variant === 'mini') {
    return (
      <div className={`bg-primary rounded-hero p-space-xl relative overflow-hidden ${className}`}>
        {/* Leaf watermark */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[80px] text-on-primary">eco</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <span className="material-symbols-outlined icon-sm text-[#DCEEDF]">eco</span>
            <span className="text-label-md text-[#DCEEDF] uppercase tracking-wider font-semibold">
              Số dư điểm xanh
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <CountUp
              end={wallet.points}
              duration={1000}
              separator="."
              className="text-display-lg text-on-primary tracking-tight"
            />
            <span className="text-title-lg text-[#DCEEDF] font-normal">điểm</span>
          </div>
          <p className="text-body-md text-[#DCEEDF]/80 mt-space-2xs">
            Tương đương khoảng <strong className="text-on-primary">{wallet.equivalentVND.toLocaleString('vi-VN')}đ</strong> mua sắm & đổi quà
          </p>
        </div>
      </div>
    );
  }

  // Full variant with chart
  return (
    <div className={`bg-primary rounded-card sm:rounded-hero p-5 sm:p-space-2xl md:p-space-3xl relative overflow-hidden ${className}`}>
      {/* Leaf watermark */}
      <div className="absolute right-4 top-4 opacity-[0.07] pointer-events-none">
        <span className="material-symbols-outlined text-[120px] sm:text-[160px] text-on-primary">eco</span>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg sm:gap-space-2xl">
        {/* Left: Points */}
        <div>
          <div className="flex items-center gap-space-xs mb-space-xs sm:mb-space-sm">
            <span className="material-symbols-outlined icon-md text-[#DCEEDF]">eco</span>
            <span className="text-label-sm sm:text-label-md text-[#DCEEDF] uppercase tracking-wider font-semibold">
              Số dư điểm xanh
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <CountUp
              end={wallet.points}
              duration={1200}
              separator="."
              className="text-[38px] leading-[46px] sm:text-[56px] sm:leading-[64px] font-bold text-on-primary tracking-tight"
            />
            <span className="text-title-lg sm:text-headline-md text-[#DCEEDF] font-normal">điểm</span>
          </div>
          <p className="text-body-sm sm:text-body-lg text-[#DCEEDF]/80 mt-space-xs">
            Tương đương khoảng <strong className="text-on-primary">{wallet.equivalentVND.toLocaleString('vi-VN')}đ</strong> mua sắm & đổi quà
          </p>
        </div>

        {/* Right: Bar Chart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-card p-4 sm:p-space-xl min-w-0 sm:min-w-[280px]">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined icon-sm text-[#DCEEDF]">bar_chart</span>
              <span className="text-title-md text-on-primary">Điểm nhận theo tháng</span>
            </div>
            <span className="text-label-sm text-[#DCEEDF]/70">Gần nhất 6T</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {impact.monthlyPoints.map((val, i) => {
              const maxVal = Math.max(...impact.monthlyPoints);
              const height = (val / maxVal) * 100;
              const isLast = i === impact.monthlyPoints.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    className={`w-full rounded-t-md ${isLast ? 'bg-on-primary' : 'bg-on-primary/40'}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-2">
            {['T4', 'T5', 'T6', 'T7', 'T8', 'T9'].map((m, i) => (
              <span
                key={m}
                className={`flex-1 text-center text-label-sm ${
                  i === 5 ? 'text-on-primary font-semibold' : 'text-[#DCEEDF]/60'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
