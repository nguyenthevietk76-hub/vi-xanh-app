import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import CountUp from '../components/CountUp';
import ScrollReveal, { ScrollRevealItem } from '../components/ScrollReveal';
import WalletPointCounter from '../components/WalletPointCounter';
import ProductCard from '../components/ProductCard';
import { PROJECT_INFO } from '../data/projectInfo';
import { TRADE_IN_RATES, POINT_VALUE_VND, isRedeemOnly } from '../lib/points';

export default function Home() {
  const { openTradeIn, wallet, products } = useApp();
  const navigate = useNavigate();

  // Quà độc quyền đổi điểm — ưu tiên món ví đủ điểm hoặc gần đủ nhất
  const suggestedProducts = products
    .filter(p => isRedeemOnly(p) && p.stock > 0)
    .sort((a, b) => Math.abs(a.points - wallet.points) - Math.abs(b.points - wallet.points))
    .slice(0, 4);

  // Chỉ hiển thị thông tin chương trình có thật (lấy từ cấu hình), không hiển thị số liệu tăng trưởng chưa kiểm chứng
  const metrics = [
    { label: 'Loại đồ nhận', value: PROJECT_INFO.acceptedItems.length, suffix: '', unit: 'loại', icon: 'recycling' },
    { label: 'Điểm thu gom thí điểm', value: PROJECT_INFO.collectionPoints.length, suffix: '', unit: 'điểm', icon: 'pin_drop' },
    { label: 'Quần áo loại A', value: Math.max(...TRADE_IN_RATES.map(r => r.rate)), suffix: '', unit: 'điểm/kg', icon: 'checkroom' },
    { label: '1 điểm xanh', value: POINT_VALUE_VND, suffix: 'đ', unit: '', icon: 'eco' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ═══ HERO ═══ */}
      <section className="relative w-full -mt-20 overflow-hidden bg-gradient-to-b from-[#0d2018] via-[#12281e] to-[#163327] text-on-primary">
        {/* Hero Background Image */}
        <img
          src="/images/hero-bg.jpg"
          alt="Ví Xanh - Không gian xanh"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-55 transform-gpu scale-105"
        />

        {/* Contrast Overlay: Soft tint ensuring text is easily readable while background shines */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2018]/75 via-[#0d2018]/45 to-[#163327]/85 pointer-events-none" />

        {/* Ambient radials */}
        <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen overflow-hidden">
          <svg className="w-full h-full" fill="none" viewBox="0 0 1440 900">
            <circle cx="200" cy="180" r="420" fill="url(#hero-r1)" />
            <circle cx="1200" cy="550" r="540" fill="url(#hero-r2)" />
            <defs>
              <radialGradient id="hero-r1" cx="0" cy="0" r="1" gradientTransform="translate(200 180) scale(420)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#b1f1ca" stopOpacity="0.35" />
                <stop offset="1" stopColor="#0d2018" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hero-r2" cx="0" cy="0" r="1" gradientTransform="translate(1200 550) scale(540)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#346f51" stopOpacity="0.4" />
                <stop offset="1" stopColor="#163327" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>


        <div className="relative z-10 max-w-content mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-32 pb-16 sm:pt-40 sm:pb-20 md:pt-48 md:pb-28 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-space-xs px-3 sm:px-space-md py-1.5 rounded-chip bg-white/10 backdrop-blur-md text-secondary-fixed text-label-sm sm:text-label-md font-semibold mb-space-lg sm:mb-space-2xl"
          >
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
            <span>Hệ sinh thái tuần hoàn • Hành động xanh 2026</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[28px] leading-[36px] xs:text-[32px] xs:leading-[40px] sm:text-display-lg md:text-[48px] md:leading-[56px] text-surface-container-lowest max-w-4xl tracking-tight font-bold"
          >
            Đổi hành động xanh, nhận giá trị thật
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-space-md sm:mt-space-lg max-w-2xl text-body-sm sm:text-body-lg text-surface-container-low/85 leading-relaxed"
          >
            Mang đồ cũ đến điểm đổi, dùng điểm đổi sản phẩm xanh, và theo dõi toàn bộ tác động của bạn trong một ví duy nhất.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-space-2xl sm:mt-space-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-space-md w-full sm:w-auto max-w-xs sm:max-w-none"
          >
            <button
              onClick={openTradeIn}
              className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                         bg-surface-container-lowest text-primary rounded-chip font-semibold text-label-lg
                         shadow-xl hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full sm:w-auto"
            >
              Bắt đầu đổi đồ
              <span className="material-symbols-outlined icon-sm">arrow_forward</span>
            </button>
            <Link
              to="/cua-hang"
              className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                         bg-white/20 hover:bg-white/25 border border-white/30 text-surface-container-lowest rounded-chip
                         font-semibold text-label-lg backdrop-blur-sm transition-all duration-150 w-full sm:w-auto"
            >
              <span className="material-symbols-outlined icon-sm">storefront</span>
              Khám phá cửa hàng
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop flex flex-col gap-space-2xl sm:gap-space-4xl py-space-xl sm:py-space-3xl">

        {/* ── Metrics Ribbon ── */}
        <ScrollReveal preset="fade-up" className="-mt-10 sm:-mt-14 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-space-md">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.6, duration: 0.4 }}
                className="bg-surface-container-low rounded-card sm:rounded-hero p-3.5 sm:p-space-xl flex flex-col justify-between shadow-subtle card-hover"
              >
                <div className="flex items-center justify-between mb-space-xs sm:mb-space-sm">
                  <span className="text-[11px] sm:text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">{m.label}</span>
                  <span className="material-symbols-outlined text-[18px] sm:icon-md text-secondary">{m.icon}</span>
                </div>
                <div className="text-title-lg sm:text-headline-lg text-primary tracking-tight font-bold">
                  <CountUp end={m.value} separator="." className="font-bold" />
                  {m.suffix && <span>{m.suffix}</span>}
                  {m.unit && <span className="text-label-sm sm:text-title-lg text-on-surface-variant font-normal ml-1">{m.unit}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── 3 Feature Cards ── */}
        <ScrollReveal preset="fade-up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg sm:mb-space-2xl gap-space-sm">
            <div>
              <span className="text-label-sm sm:text-label-md text-secondary uppercase tracking-widest font-semibold">Quy trình thông minh</span>
              <h2 className="text-headline-sm sm:text-headline-lg text-primary mt-1 tracking-tight font-bold">Giải pháp tiêu dùng khép kín</h2>
            </div>
            <p className="text-body-sm sm:text-body-md text-on-surface-variant max-w-md leading-relaxed">
              Chuyển hóa vòng đời đồ dùng cũ thành dòng tuần hoàn mới, mang lại năng lượng sống bền vững cho môi trường đô thị.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md sm:gap-space-lg">
            {[
              { title: 'Đổi đồ cũ', desc: 'Gửi quần áo cũ và bã cà phê để quy đổi thành điểm xanh tiện ích dùng ngay.', icon: 'autorenew', color: 'bg-secondary-fixed/50 text-primary', action: () => openTradeIn(), linkText: 'Đổi ngay', linkColor: 'text-secondary' },
              { title: 'Dùng điểm xanh', desc: 'Dùng điểm xanh để giảm giá khi mua (tối đa 50% đơn, không quá 200 điểm), hoặc đổi trọn những món quà độc quyền chỉ dành cho thành viên.', icon: 'swap_horiz', color: 'bg-sky-tint text-primary', action: () => navigate('/cua-hang'), linkText: 'Xem sản phẩm', linkColor: 'text-[#3563A8]' },
              { title: 'Ví xanh', desc: 'Theo dõi số dư điểm, lịch sử giao dịch minh bạch và toàn bộ tác động môi trường bạn đóng góp.', icon: 'account_balance_wallet', color: 'bg-sunlit-ochre text-sunlit-ochre-text', action: () => navigate('/vi-cua-toi'), linkText: 'Xem ví', linkColor: 'text-[#A9822E]' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -2 }}
                className="bg-surface-container-lowest rounded-card sm:rounded-hero p-5 sm:p-7 flex flex-col justify-between shadow-level-2 hover:shadow-level-2-hover transition-shadow group"
              >
                <div>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${f.color} flex items-center justify-center mb-space-lg sm:mb-space-xl group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined text-[24px] sm:icon-xl">{f.icon}</span>
                  </div>
                  <h3 className="text-title-lg sm:text-headline-sm text-primary mb-space-xs font-semibold">{f.title}</h3>
                  <p className="text-body-sm sm:text-body-md text-on-surface-variant leading-relaxed mb-space-lg sm:mb-space-xl">{f.desc}</p>
                </div>
                <button onClick={f.action} className={`inline-flex items-center gap-space-xs text-label-md sm:text-label-lg font-semibold ${f.linkColor} hover:text-primary transition-colors py-1`}>
                  {f.linkText}
                  <span className="material-symbols-outlined icon-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Bento: Photo + Chart ── */}
        <ScrollReveal preset="fade-up" delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md sm:gap-space-lg items-stretch">
            {/* Photo */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-card sm:rounded-hero overflow-hidden shadow-level-2 flex flex-col justify-between relative min-h-[260px] sm:min-h-[320px]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBedrXkDwnbuXtA7NXRoNvwdmVLTEA92SaCQJcW2cZxNeQbVHxP1_eiUXtPdLJal30Gax8zhhNi9nq6H4yEOxy7nMFCZptAOzyZNlErSTJUduxy6fd6P7cTyf50T9GRjzVAFns2lHbH1Qc03z_-QnrWvzuUBlo_rZUIaHgwB8am3nBNUF2Fzi_nsuJpCXQSRqEDXhnJf1NWIvF5kWonuc-AXcRvricqDqDdpSqe8OGYU_h3liDXnVHl"
                alt="Trạm quy đổi xanh"
                className="w-full h-full object-cover absolute inset-0"
                loading="lazy"
              />
              <div className="relative z-10 p-4 sm:p-space-2xl bg-gradient-to-t from-primary/95 via-primary/50 to-transparent mt-auto text-on-primary">
                <span className="text-label-sm uppercase tracking-wider text-secondary-fixed font-semibold">Ảnh minh hoạ</span>
                <h4 className="text-title-md sm:text-title-lg font-semibold mt-1">Điểm thu gom quần áo cũ & bã cà phê</h4>
                <p className="text-body-xs sm:text-body-sm text-surface-container-low/90 mt-1 max-w-md">Đồ được cân lại và phân loại ngay tại điểm nhận — điểm xanh tính theo cân thực tế.</p>
              </div>
            </div>

            {/* Bảng quy đổi điểm — số liệu lấy từ src/lib/points.js */}
            <div className="lg:col-span-5 bg-surface-container rounded-card sm:rounded-hero p-4 sm:p-space-2xl flex flex-col justify-between shadow-subtle">
              <div>
                <span className="text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Minh bạch</span>
                <h3 className="text-title-lg sm:text-headline-sm text-primary font-semibold mt-1">Bảng quy đổi điểm</h3>
                <p className="text-body-xs sm:text-body-sm text-on-surface-variant mt-1 leading-relaxed">Điểm được tính theo số kg cân tại điểm thu gom.</p>
              </div>
              <ul className="my-space-lg divide-y divide-outline-variant/30">
                {TRADE_IN_RATES.map(r => (
                  <li key={r.id} className="flex items-center justify-between gap-space-md py-2">
                    <span className="flex items-center gap-space-xs min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">{r.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-body-sm font-medium truncate">{r.shortName}</span>
                        <span className="block text-[11px] text-on-surface-variant truncate">{r.desc}</span>
                      </span>
                    </span>
                    <span className="text-label-md font-bold text-primary shrink-0">{r.rate} {r.unit}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-space-md border-t border-outline-variant/30">
                <span className="text-body-sm font-medium">1 điểm xanh ≈</span>
                <span className="text-title-lg sm:text-headline-sm text-primary font-bold">{POINT_VALUE_VND.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Personalized Suggestions ── */}
        {suggestedProducts.length > 0 && (
          <ScrollReveal preset="fade-up" delay={0.1}>
            <div className="flex items-end justify-between mb-space-lg sm:mb-space-xl">
              <div>
                <span className="text-label-sm sm:text-label-md text-secondary uppercase tracking-widest font-semibold">Gợi ý cho bạn</span>
                <h2 className="text-title-lg sm:text-headline-md text-primary mt-0.5 tracking-tight font-bold">Quà độc quyền đổi bằng điểm xanh</h2>
              </div>
              <Link to="/cua-hang" className="text-label-sm sm:text-label-lg text-secondary font-semibold hover:text-primary transition-colors flex items-center gap-1 shrink-0">
                Xem tất cả <span className="material-symbols-outlined icon-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md sm:gap-space-lg">
              {suggestedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* ── CTA Banner ── */}
        <ScrollReveal preset="fade-up">
          <section className="w-full bg-secondary-fixed rounded-card sm:rounded-hero p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg sm:gap-space-xl shadow-level-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 pointer-events-none opacity-10 flex items-center pr-6">
              <span className="material-symbols-outlined text-[140px] sm:text-[180px] text-primary select-none">eco</span>
            </div>
            <div className="relative z-10 flex flex-col max-w-xl text-left">
              <div className="inline-flex items-center gap-space-xs justify-start mb-space-xs">
                <span className="material-symbols-outlined icon-sm sm:icon-md text-primary">campaign</span>
                <span className="text-label-xs sm:text-label-md text-on-secondary-fixed-variant uppercase tracking-wider font-bold">Dự án thí điểm</span>
              </div>
              <h2 className="text-headline-sm sm:text-headline-md md:text-headline-lg text-primary font-bold tracking-tight">
                Cho quần áo cũ và bã cà phê một vòng đời mới
              </h2>
              <p className="text-body-sm sm:text-body-md text-on-secondary-container mt-space-xs leading-relaxed">
                Dự án khởi nghiệp của nhóm sinh viên Ví Xanh. Xem đồ bạn gửi được xử lý ra sao và tiến độ đợt thu gom đầu tiên.
              </p>
            </div>
            <Link
              to="/du-an"
              className="relative z-10 inline-flex items-center justify-center px-space-2xl py-3.5 bg-primary text-on-primary rounded-chip font-semibold text-label-md sm:text-label-lg shadow-level-2 hover:brightness-110 transition-all active:scale-95 w-full md:w-auto"
            >
              Xem dự án
              <span className="material-symbols-outlined icon-sm ml-space-xs">north_east</span>
            </Link>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
