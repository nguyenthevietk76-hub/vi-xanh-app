import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import CountUp from '../components/CountUp';
import ScrollReveal, { ScrollRevealItem } from '../components/ScrollReveal';
import WalletPointCounter from '../components/WalletPointCounter';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { openTradeIn, wallet, products, impact } = useApp();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Products user can almost afford (within 200 points)
  const suggestedProducts = products
    .filter(p => p.points <= wallet.points + 200 && p.points > 0)
    .sort((a, b) => a.points - b.points)
    .slice(0, 4);

  const metrics = [
    { label: 'Rác đã thu gom', value: 128, suffix: '', unit: 'tấn', icon: 'recycling' },
    { label: 'Người dùng', value: 42000, suffix: '+', unit: '', icon: 'groups' },
    { label: 'Cây xanh quy đổi', value: 15000, suffix: '', unit: '', icon: 'forest' },
    { label: 'Điểm thu gom', value: 86, suffix: '', unit: 'trạm', icon: 'pin_drop' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ═══ HERO ═══ */}
      <section className="relative w-full -mt-20 overflow-hidden bg-gradient-to-b from-[#0d2018] via-[#12281e] to-[#163327] text-on-primary">
        {/* Background Video: Looping, hardware accelerated (GPU) & zero-lag */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/videos/hero-bg.mp4"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-65 transform-gpu"
        />

        {/* Contrast Overlay: Soft tint ensuring text is easily readable while video shines */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2018]/70 via-[#0d2018]/40 to-[#163327]/80 pointer-events-none" />

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


        <div className="relative z-10 max-w-content mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-40 pb-20 md:pt-48 md:pb-28 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-chip bg-white/10 backdrop-blur-md text-secondary-fixed text-label-md font-semibold mb-space-2xl"
          >
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
            <span>Hệ sinh thái tuần hoàn • Hành động xanh 2026</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-display-lg md:text-[48px] md:leading-[56px] text-surface-container-lowest max-w-4xl tracking-tight font-bold"
          >
            Đổi hành động xanh, nhận giá trị thật
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-space-lg max-w-2xl text-body-lg text-surface-container-low/80 leading-relaxed"
          >
            Mang đồ cũ đến điểm đổi, dùng điểm đổi sản phẩm xanh, và theo dõi toàn bộ tác động của bạn trong một ví duy nhất.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-space-3xl flex flex-wrap items-center justify-center gap-space-md"
          >
            <button
              onClick={openTradeIn}
              className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                         bg-surface-container-lowest text-primary rounded-chip font-semibold text-label-lg
                         shadow-xl hover:bg-surface-container-low transition-all active:scale-95 duration-150"
            >
              Bắt đầu đổi đồ
              <span className="material-symbols-outlined icon-sm">arrow_forward</span>
            </button>
            <Link
              to="/cua-hang"
              className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                         bg-white/10 hover:bg-white/15 text-surface-container-lowest rounded-chip
                         font-semibold text-label-lg backdrop-blur-sm transition-all duration-150"
            >
              <span className="material-symbols-outlined icon-sm">storefront</span>
              Khám phá cửa hàng
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop flex flex-col gap-space-4xl py-space-3xl">

        {/* ── Metrics Ribbon ── */}
        <ScrollReveal preset="fade-up" className="-mt-14 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.6, duration: 0.4 }}
                className="bg-surface-container-low rounded-hero p-space-xl flex flex-col justify-between shadow-subtle card-hover"
              >
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">{m.label}</span>
                  <span className="material-symbols-outlined icon-md text-secondary">{m.icon}</span>
                </div>
                <div className="text-headline-lg text-primary tracking-tight">
                  <CountUp end={m.value} separator="." className="font-bold" />
                  {m.suffix && <span>{m.suffix}</span>}
                  {m.unit && <span className="text-title-lg text-on-surface-variant font-normal ml-1">{m.unit}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── 3 Feature Cards ── */}
        <ScrollReveal preset="fade-up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-sm">
            <div>
              <span className="text-label-md text-secondary uppercase tracking-widest">Quy trình thông minh</span>
              <h2 className="text-headline-lg text-primary mt-1 tracking-tight font-bold">Giải pháp tiêu dùng khép kín</h2>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-md">
              Chuyển hóa vòng đời đồ dùng cũ thành dòng tuần hoàn mới, mang lại năng lượng sống bền vững cho môi trường đô thị.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {[
              { title: 'Đổi đồ cũ', desc: 'Gửi quần áo, đồ điện tử, đồ nhựa cũ để quy đổi thành điểm xanh tiện ích dùng ngay.', icon: 'autorenew', color: 'bg-secondary-fixed/50 text-primary', action: () => openTradeIn(), linkText: 'Đổi ngay', linkColor: 'text-secondary' },
              { title: 'Đổi sản phẩm', desc: 'Dùng điểm xanh để đổi lấy sản phẩm thân thiện môi trường trong hệ thống cửa hàng Ví Xanh.', icon: 'swap_horiz', color: 'bg-sky-tint text-primary', action: () => navigate('/cua-hang'), linkText: 'Xem sản phẩm', linkColor: 'text-[#3563A8]' },
              { title: 'Ví xanh', desc: 'Theo dõi số dư điểm, lịch sử giao dịch minh bạch và toàn bộ tác động môi trường bạn đóng góp.', icon: 'account_balance_wallet', color: 'bg-sunlit-ochre text-sunlit-ochre-text', action: () => navigate('/vi-cua-toi'), linkText: 'Xem ví', linkColor: 'text-[#A9822E]' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -2 }}
                className="bg-surface-container-lowest rounded-hero p-7 flex flex-col justify-between shadow-level-2 hover:shadow-level-2-hover transition-shadow group"
              >
                <div>
                  <div className={`w-14 h-14 rounded-full ${f.color} flex items-center justify-center mb-space-xl group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined icon-xl">{f.icon}</span>
                  </div>
                  <h3 className="text-headline-sm text-primary mb-space-xs font-semibold">{f.title}</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed mb-space-xl">{f.desc}</p>
                </div>
                <button onClick={f.action} className={`inline-flex items-center gap-space-xs text-label-lg font-semibold ${f.linkColor} hover:text-primary transition-colors`}>
                  {f.linkText}
                  <span className="material-symbols-outlined icon-sm group-hover:translate-x-1 transition-transform">{f.title === 'Ví xanh' ? 'arrow_forward' : 'arrow_forward'}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Bento: Photo + Chart ── */}
        <ScrollReveal preset="fade-up" delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
            {/* Photo */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-hero overflow-hidden shadow-level-2 flex flex-col justify-between relative min-h-[320px]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBedrXkDwnbuXtA7NXRoNvwdmVLTEA92SaCQJcW2cZxNeQbVHxP1_eiUXtPdLJal30Gax8zhhNi9nq6H4yEOxy7nMFCZptAOzyZNlErSTJUduxy6fd6P7cTyf50T9GRjzVAFns2lHbH1Qc03z_-QnrWvzuUBlo_rZUIaHgwB8am3nBNUF2Fzi_nsuJpCXQSRqEDXhnJf1NWIvF5kWonuc-AXcRvricqDqDdpSqe8OGYU_h3liDXnVHl"
                alt="Trạm quy đổi xanh"
                className="w-full h-full object-cover absolute inset-0"
                loading="lazy"
              />
              <div className="relative z-10 p-space-2xl bg-gradient-to-t from-primary/90 via-primary/40 to-transparent mt-auto text-on-primary">
                <span className="text-label-sm uppercase tracking-wider text-secondary-fixed">Hiện trường thực tế</span>
                <h4 className="text-title-lg font-semibold mt-1">Trạm quy đổi xanh Quận 1, TP. Hồ Chí Minh</h4>
                <p className="text-body-sm text-surface-container-low/90 mt-1 max-w-md">Mỗi điểm tiếp nhận được chuẩn hóa quy trình phân loại carbon-neutral.</p>
              </div>
            </div>

            {/* Chart */}
            <div className="lg:col-span-5 bg-surface-container rounded-hero p-space-2xl flex flex-col justify-between shadow-subtle">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Tác động tuần qua</span>
                  <span className="px-2.5 py-1 rounded-chip bg-secondary-fixed text-on-secondary-fixed text-label-sm font-semibold">+24.8%</span>
                </div>
                <h3 className="text-headline-sm text-primary font-semibold">Biểu đồ CO₂ giảm thiểu</h3>
                <p className="text-body-sm text-on-surface-variant mt-1">Tổng lượng khí thải carbon được ngăn ngừa từ 1.200 món đồ được tái sử dụng thành công.</p>
              </div>
              <div className="my-space-xl">
                <svg className="w-full h-28 overflow-visible" fill="none" viewBox="0 0 320 80">
                  <path d="M0 65 Q 40 50, 80 58 T 160 38 T 240 25 T 320 10" fill="none" stroke="#2e694b" strokeLinecap="round" strokeWidth="3" />
                  <path d="M0 65 Q 40 50, 80 58 T 160 38 T 240 25 T 320 10 L 320 80 L 0 80 Z" fill="url(#co2-g)" opacity="0.3" />
                  <circle cx="80" cy="58" r="4" fill="white" stroke="#2e694b" strokeWidth="2" />
                  <circle cx="160" cy="38" r="4" fill="white" stroke="#2e694b" strokeWidth="2" />
                  <circle cx="240" cy="25" r="4" fill="white" stroke="#2e694b" strokeWidth="2" />
                  <circle cx="320" cy="10" r="5" fill="#2e694b" stroke="white" strokeWidth="2" />
                  <defs>
                    <linearGradient id="co2-g" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2e694b" />
                      <stop offset="1" stopColor="#2e694b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-between text-label-sm text-outline mt-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <span key={d}>{d}</span>)}
                  <span className="font-semibold text-primary">CN</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-space-md border-t border-outline-variant/30">
                <span className="text-body-sm font-medium">Mục tiêu quý này</span>
                <span className="text-headline-sm text-primary font-bold">78%</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Personalized Suggestions ── */}
        {suggestedProducts.length > 0 && (
          <ScrollReveal preset="fade-up" delay={0.1}>
            <div className="flex items-end justify-between mb-space-xl">
              <div>
                <span className="text-label-md text-secondary uppercase tracking-widest">Gợi ý cho bạn</span>
                <h2 className="text-headline-md text-primary mt-1 tracking-tight font-bold">Sản phẩm bạn sắp đổi được</h2>
              </div>
              <Link to="/cua-hang" className="text-label-lg text-secondary font-semibold hover:text-primary transition-colors flex items-center gap-1">
                Xem tất cả <span className="material-symbols-outlined icon-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              {suggestedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* ── CTA Banner ── */}
        <ScrollReveal preset="fade-up">
          <section className="w-full bg-secondary-fixed rounded-hero p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-space-xl shadow-level-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 pointer-events-none opacity-10 flex items-center pr-6">
              <span className="material-symbols-outlined text-[180px] text-primary select-none">eco</span>
            </div>
            <div className="relative z-10 flex flex-col max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-space-xs justify-center md:justify-start mb-space-xs">
                <span className="material-symbols-outlined icon-md text-primary">campaign</span>
                <span className="text-label-md text-on-secondary-fixed-variant uppercase tracking-wider font-semibold">Chiến dịch trọng điểm</span>
              </div>
              <h2 className="text-headline-md md:text-headline-lg text-primary font-bold tracking-tight">
                Tham gia dự án làm sạch Việt Nam
              </h2>
              <p className="text-body-md text-on-secondary-container mt-space-xs leading-relaxed">
                Góp sức cùng 40+ tổ chức đối tác nhằm dọn sạch các bãi rác tự phát và trồng thêm 50.000 cây đước chắn sóng tại miền duyên hải.
              </p>
            </div>
            <Link
              to="/du-an"
              className="relative z-10 inline-flex items-center justify-center px-space-2xl py-3.5 bg-primary text-on-primary rounded-chip font-semibold text-label-lg shadow-level-2 hover:brightness-110 transition-all active:scale-95"
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
