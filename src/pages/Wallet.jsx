import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { EXCHANGE_RATES } from '../data/mockData';
import WalletPointCounter from '../components/WalletPointCounter';
import Button from '../components/Button';
import Chip from '../components/Chip';
import ScrollReveal from '../components/ScrollReveal';
import CountUp from '../components/CountUp';
import MyRealOrders from '../components/MyRealOrders';

export default function Wallet() {
  const { user, wallet, transactions, impact, milestones, openTradeIn, vouchers } = useApp();
  const navigate = useNavigate();
  const [txFilter, setTxFilter] = useState('all');
  const [showAllTx, setShowAllTx] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const filteredTx = transactions.filter(tx => {
    if (txFilter === 'earn') return tx.points > 0;
    if (txFilter === 'spend') return tx.points < 0;
    return true;
  });
  const displayedTx = showAllTx ? filteredTx : filteredTx.slice(0, 5);

  return (
    <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-2xl">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-lg sm:mb-space-xl">
        <div className="flex items-center gap-space-xs text-body-sm sm:text-body-md text-on-surface-variant">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Trang chủ</button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Ví của tôi</span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined icon-sm text-secondary">verified</span>
          <span className="text-label-sm sm:text-label-md text-on-surface-variant">
            Hội viên Xanh {user.memberTier} • Mã Ví #{user.memberId}
          </span>
        </div>
      </div>

      {/* ═══ Wallet Hero ═══ */}
      <ScrollReveal preset="fade-up">
        <WalletPointCounter variant="full" className="mb-space-lg sm:mb-space-xl" />

        {/* Quick Actions */}
        <div className="flex gap-space-sm sm:gap-space-md mb-space-2xl sm:mb-space-3xl">
          <Button onClick={() => navigate('/cua-hang')} icon="swap_horiz" className="flex-1" size="md">
            Đổi điểm
          </Button>
          <Button variant="secondary" onClick={openTradeIn} icon="add_circle" className="flex-1" size="md">
            Nạp thêm
          </Button>
        </div>
      </ScrollReveal>

      {/* ═══ 3 Quick Action Cards ═══ */}
      <ScrollReveal preset="fade-up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md sm:gap-space-lg mb-space-2xl sm:mb-space-3xl">
          {[
            { title: 'Đổi đồ cũ', desc: 'Gửi đồ nhận điểm tích luỹ xanh', icon: 'autorenew', action: openTradeIn, color: 'bg-secondary-fixed/50' },
            { title: 'Đổi sản phẩm', desc: 'Mua sắm xanh bằng điểm thưởng', icon: 'shopping_bag', action: () => navigate('/cua-hang'), color: 'bg-sunlit-ochre/50' },
            { title: 'Tỷ lệ quy đổi', desc: 'Xem bảng quy đổi điểm chuẩn', icon: 'currency_exchange', action: null, color: 'bg-sky-tint/50' },
          ].map(card => (
            <motion.button
              key={card.title}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={card.action}
              className="bg-surface-container-lowest rounded-card p-4 sm:p-space-xl flex items-center gap-space-md sm:gap-space-lg shadow-level-2 hover:shadow-level-2-hover transition-shadow text-left"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${card.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[22px] sm:icon-lg text-primary">{card.icon}</span>
              </div>
              <div>
                <div className="text-title-md font-semibold text-on-surface">{card.title}</div>
                <div className="text-body-sm text-on-surface-variant">{card.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </ScrollReveal>

      {/* ═══ Exchange Rates ═══ */}
      <ScrollReveal preset="fade-up" delay={0.1}>
        <div className="flex items-center justify-between mb-space-md sm:mb-space-lg">
          <div>
            <h2 className="text-title-lg sm:text-headline-sm text-primary font-bold">Tỷ lệ quy đổi tham khảo</h2>
            <p className="text-body-xs sm:text-body-sm text-on-surface-variant mt-0.5">Mức điểm thưởng ước tính nhận được trên mỗi kg đồ thu gom đạt chuẩn</p>
          </div>
          <button className="text-label-sm sm:text-label-lg text-secondary font-semibold hover:text-primary transition-colors flex items-center gap-1 shrink-0">
            Chi tiết <span className="material-symbols-outlined icon-sm">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-space-md mb-space-2xl sm:mb-space-3xl">
          {EXCHANGE_RATES.map(rate => (
            <div key={rate.id} className="bg-surface-container-lowest rounded-card p-3.5 sm:p-space-xl shadow-subtle card-hover">
              <div className="flex items-center justify-between mb-space-xs sm:mb-space-md">
                <span className="text-label-sm sm:text-body-md text-on-surface font-semibold">{rate.name}</span>
                <span className="material-symbols-outlined text-[18px] sm:icon-md text-on-surface-variant">{rate.icon}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] sm:text-[32px] leading-[34px] sm:leading-[40px] font-bold text-primary">{rate.rate}</span>
                <span className="text-label-sm sm:text-body-md text-on-surface-variant">{rate.unit}</span>
              </div>
              <p className="text-body-xs sm:text-body-sm text-on-surface-variant mt-1 leading-snug">{rate.desc}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ═══ Transaction History ═══ */}
      <ScrollReveal preset="fade-up" delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-space-md sm:mb-space-lg">
          <div className="flex items-center gap-2 sm:gap-space-md">
            <h2 className="text-title-lg sm:text-headline-sm text-primary font-bold">Lịch sử giao dịch</h2>
            <span className="text-label-sm sm:text-label-md text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-chip">{filteredTx.length} gần nhất</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'earn', label: 'Nhận điểm' },
              { id: 'spend', label: 'Dùng điểm' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTxFilter(f.id)}
                className={`px-3 py-1 sm:px-space-md sm:py-space-xs rounded-chip text-label-sm sm:text-label-lg font-semibold transition-all whitespace-nowrap shrink-0
                  ${txFilter === f.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-space-xs mb-space-md">
          <AnimatePresence>
            {displayedTx.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-container-lowest rounded-card p-space-lg flex items-center gap-space-md shadow-subtle hover:shadow-level-2 transition-shadow"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  ${tx.points > 0 ? 'bg-[#DCEEDF] text-secondary' : 'bg-coral-mist text-coral-mist-text'}`}>
                  <span className="material-symbols-outlined icon-md">
                    {tx.points > 0 ? 'add_circle' : 'remove_circle'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-md text-on-surface font-medium truncate">{tx.desc}</div>
                  <div className="text-label-sm text-on-surface-variant mt-0.5">
                    {new Date(tx.date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>
                <span className={`text-title-lg font-bold shrink-0
                  ${tx.points > 0 ? 'text-secondary' : 'text-coral-mist-text'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString('vi-VN')} điểm
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTx.length > 5 && (
          <button
            onClick={() => setShowAllTx(!showAllTx)}
            className="w-full py-space-md text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-space-xs border border-outline-variant/30 rounded-card"
          >
            {showAllTx ? 'Thu gọn' : 'Xem thêm giao dịch cũ hơn'}
            <span className="material-symbols-outlined icon-sm">{showAllTx ? 'expand_less' : 'expand_more'}</span>
          </button>
        )}
      </ScrollReveal>

      <MyRealOrders />

      {/* ═══ Milestones & Vouchers ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl mt-space-3xl">
        {/* Milestones */}
        <ScrollReveal preset="fade-left">
          <h2 className="text-headline-sm text-primary font-bold mb-space-lg">Huy hiệu & Cột mốc</h2>
          <div className="space-y-space-sm">
            {milestones.map(m => (
              <div key={m.id} className={`flex items-center gap-space-md p-space-lg rounded-card transition-colors
                ${m.achieved ? 'bg-surface-container-lowest shadow-subtle' : 'bg-surface-container-low opacity-60'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  ${m.achieved ? 'bg-sunlit-ochre text-sunlit-ochre-text' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined icon-md">{m.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="text-title-md font-semibold text-on-surface">{m.title}</div>
                  <div className="text-body-sm text-on-surface-variant">{m.desc}</div>
                </div>
                {m.achieved && <Chip variant="milestone">Đã đạt</Chip>}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Vouchers */}
        <ScrollReveal preset="fade-right">
          <h2 className="text-headline-sm text-primary font-bold mb-space-lg">Voucher đang có</h2>
          <div className="space-y-space-sm">
            {vouchers.map(v => (
              <motion.button
                key={v.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedVoucher(v)}
                className="w-full flex items-center gap-space-md p-space-lg bg-surface-container-lowest rounded-card shadow-subtle hover:shadow-level-2 transition-shadow text-left"
              >
                <div className="w-12 h-12 rounded-nested bg-[#DCEEDF] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined icon-lg text-primary">confirmation_number</span>
                </div>
                <div className="flex-1">
                  <div className="text-title-md font-semibold text-on-surface">{v.title}</div>
                  <div className="text-body-sm text-on-surface-variant">Mã: {v.code} · HSD: {v.expiresAt}</div>
                </div>
                <span className="material-symbols-outlined icon-md text-on-surface-variant">qr_code_2</span>
              </motion.button>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* ═══ Personal Impact ═══ */}
      <ScrollReveal preset="fade-up" delay={0.1} className="mt-space-3xl">
        <h2 className="text-headline-sm text-primary font-bold mb-space-lg">Đóng góp tác động cá nhân</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
          {[
            { label: 'Đồ đã quy đổi', value: '13.5 kg', icon: 'scale' },
            { label: 'CO₂ tiết kiệm', value: '21.6 kg', icon: 'cloud_off' },
            { label: 'Cây tương đương', value: '3 cây', icon: 'park' },
            { label: 'Xếp hạng cộng đồng', value: 'Top 15%', icon: 'leaderboard' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-container-lowest rounded-card p-space-xl shadow-subtle text-center card-hover">
              <span className="material-symbols-outlined text-[28px] text-secondary mb-space-sm block">{stat.icon}</span>
              <div className="text-headline-sm text-primary font-bold">{stat.value}</div>
              <div className="text-label-sm text-on-surface-variant mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ═══ Voucher Modal ═══ */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] modal-backdrop flex items-center justify-center p-space-2xl"
            onClick={() => setSelectedVoucher(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-hero p-space-3xl max-w-sm w-full shadow-level-3 text-center"
            >
              <div className="w-48 h-48 mx-auto bg-surface-container-low rounded-card flex items-center justify-center mb-space-xl">
                <span className="material-symbols-outlined text-[80px] text-primary">qr_code_2</span>
              </div>
              <h3 className="text-headline-sm text-primary font-bold">{selectedVoucher.title}</h3>
              <p className="text-title-lg text-secondary font-bold mt-space-sm">Mã: {selectedVoucher.code}</p>
              <p className="text-body-sm text-on-surface-variant mt-space-xs">Hạn sử dụng: {selectedVoucher.expiresAt}</p>
              <Button onClick={() => setSelectedVoucher(null)} className="mt-space-xl w-full">
                Đóng
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
