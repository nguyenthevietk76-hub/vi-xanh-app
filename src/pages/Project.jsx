import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import CountUp from '../components/CountUp';
import Button from '../components/Button';

export default function Project() {
  const { impact, openTradeIn } = useApp();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="flex flex-col w-full">
      {/* ═══ HERO — Full Screen Declaration ═══ */}
      <section ref={heroRef} className="relative w-full min-h-screen -mt-20 overflow-hidden bg-[#0d2018] flex items-center justify-center">
        {/* Looping background video */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/hero-da.mp4"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2018]/70 via-[#0d2018]/50 to-[#163327]/80" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-content mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop text-center text-on-primary">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-chip bg-white/10 backdrop-blur-md text-secondary-fixed text-label-md font-semibold mb-space-2xl"
          >
            <span className="material-symbols-outlined icon-sm">eco</span>
            Dự án hành động 2026–2030
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-[28px] leading-[36px] xs:text-[34px] xs:leading-[42px] sm:text-display-lg md:text-[56px] md:leading-[64px] font-bold tracking-tight max-w-4xl mx-auto"
          >
            Chung tay làm sạch Việt Nam khỏi rác thải nhựa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-space-md sm:mt-space-xl text-body-sm sm:text-body-lg text-surface-container-low/85 max-w-2xl mx-auto leading-relaxed"
          >
            Từng bao ni-lông, chai nhựa cũ được hoàn vốn sống mới qua chu trình tái sinh minh bạch. Cùng Ví Xanh chuyển hóa hành vi nhỏ thành di sản xanh bền vững.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-space-2xl sm:mt-space-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-space-md w-full sm:w-auto max-w-xs sm:max-w-none"
          >
            <button
              onClick={openTradeIn}
              className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                         bg-surface-container-lowest text-primary rounded-chip font-semibold text-label-lg
                         shadow-xl hover:bg-surface-container-low transition-all active:scale-95 w-full sm:w-auto"
            >
              Tham gia ngay
              <span className="material-symbols-outlined icon-sm">arrow_forward</span>
            </button>
            <a href="#progress" className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                     bg-white/20 hover:bg-white/25 border border-white/30 text-surface-container-lowest rounded-chip
                     font-semibold text-label-lg backdrop-blur-sm transition-all w-full sm:w-auto">
              Xem tiến độ thực địa
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-12 sm:mt-16 flex flex-col items-center gap-2 text-surface-container-low/50"
          >
            <span className="text-label-sm">Cuộn để khám phá</span>
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="material-symbols-outlined"
            >keyboard_arrow_down</motion.span>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ PROGRESS BAR ═══ */}
      <div id="progress" className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop -mt-10 sm:-mt-14 relative z-20">
        <ScrollReveal preset="fade-up">
          <div className="bg-surface-container-lowest rounded-card sm:rounded-hero p-4 sm:p-space-2xl shadow-level-2">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Mục tiêu đến năm 2030</span>
              </div>
              <span className="text-label-md text-on-surface-variant">Giai đoạn 1 / 4</span>
            </div>
            <h3 className="text-headline-md text-primary font-bold mb-space-md">
              Thu gom và tái chế <CountUp end={1000000} separator="." className="text-primary" /> kg rác thải nhựa
            </h3>
            <div className="h-3 bg-surface-container-high rounded-chip overflow-hidden mb-space-sm">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '13%' }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                viewport={{ once: true }}
                className="h-full bg-gradient-to-r from-secondary to-primary rounded-chip"
              />
            </div>
            <div className="flex justify-between text-body-sm text-on-surface-variant">
              <span><strong className="text-primary">128.000 kg</strong> đã thu gom · 13% mục tiêu</span>
              <span>Còn 872.000 kg</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ═══ CHAPTER 1: Collection ═══ */}
      <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-4xl space-y-space-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-3xl items-center">
          <ScrollReveal preset="fade-left">
            <div className="bg-surface-container-low rounded-hero p-space-2xl">
              <div className="flex items-center gap-space-xs mb-space-xl">
                <span className="px-3 py-1 rounded-chip bg-surface-container-high text-on-surface-variant text-label-md font-semibold">Mạng lưới phân loại</span>
                <span className="material-symbols-outlined icon-md text-on-surface-variant">location_on</span>
              </div>
              <div className="grid grid-cols-2 gap-space-md mb-space-xl">
                <div className="bg-surface-container rounded-card p-space-lg">
                  <CountUp end={86} className="text-[40px] leading-[48px] font-bold text-primary" />
                  <p className="text-body-sm text-on-surface-variant mt-1">Điểm trạm thu gom rác xanh</p>
                </div>
                <div className="bg-surface-container rounded-card p-space-lg">
                  <CountUp end={12} className="text-[40px] leading-[48px] font-bold text-secondary" />
                  <p className="text-body-sm text-on-surface-variant mt-1">Tỉnh & Thành phố vận hành</p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined icon-sm text-secondary">verified</span>
                100% rác thải được dán mã truy xuất nguồn gốc QR
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal preset="fade-right" delay={0.15}>
            <div>
              <span className="text-label-md text-secondary uppercase tracking-widest">01 — Vấn đề</span>
              <h2 className="text-headline-lg text-primary font-bold mt-space-xs mb-space-md tracking-tight">Thu gom tại nguồn</h2>
              <p className="text-body-lg text-on-surface-variant leading-relaxed mb-space-xl">
                Mạng lưới 86 điểm thu gom tại 12 tỉnh thành giúp rác thải được phân loại ngay từ hộ gia đình. Từng sản phẩm nhựa được làm sạch sơ bộ, giảm tới 70% chi phí xử lý công nghiệp ở khâu sau.
              </p>
              <button className="text-label-lg text-secondary font-semibold hover:text-primary transition-colors flex items-center gap-space-xs">
                Tìm hiểu thêm <span className="material-symbols-outlined icon-sm">arrow_forward</span>
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══ CHAPTER 2: Recycling ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-3xl items-center">
          <ScrollReveal preset="fade-left" delay={0.1} className="order-2 lg:order-1">
            <span className="text-label-md text-secondary uppercase tracking-widest">02 — Giải pháp</span>
            <h2 className="text-headline-lg text-primary font-bold mt-space-xs mb-space-md tracking-tight">Tái chế và tái sử dụng</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed mb-space-xl">
              Hợp tác cùng 5 nhà máy tái chế để biến rác thải thành nguyên liệu và sản phẩm mới. Nhựa tái sinh quay lại cuộc sống dưới hình thái chậu cây, tấm lọp sinh thái và đồ dùng bền vững hàng ngày.
            </p>
            <button className="text-label-lg text-secondary font-semibold hover:text-primary transition-colors flex items-center gap-space-xs">
              Tìm hiểu thêm <span className="material-symbols-outlined icon-sm">arrow_forward</span>
            </button>
          </ScrollReveal>

          <ScrollReveal preset="fade-right" delay={0.15} className="order-1 lg:order-2">
            <div className="bg-secondary-fixed/50 rounded-hero p-space-2xl">
              <div className="flex items-center gap-space-xs mb-space-xl">
                <span className="px-3 py-1 rounded-chip bg-surface-container-lowest text-on-surface-variant text-label-md font-semibold">Quy trình khép kín</span>
                <span className="material-symbols-outlined icon-md text-secondary">settings</span>
              </div>
              <div className="bg-surface-container-lowest rounded-card p-space-xl mb-space-md">
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="text-label-md text-on-surface-variant">5 đối tác tái chế tiêu chuẩn ISO</span>
                  <span className="px-2 py-0.5 rounded-chip bg-secondary-container text-on-secondary-container text-label-sm font-semibold">100% Zero-Landfill</span>
                </div>
                <div className="flex items-center gap-space-md text-body-md text-on-surface mt-space-md">
                  <span className="font-semibold">Nhựa HDPE & PET</span>
                  <span className="material-symbols-outlined icon-sm text-secondary">arrow_forward</span>
                  <span className="font-semibold">Hạt nhựa nguyên sinh rPET</span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined icon-sm text-secondary">inventory_2</span>
                Cung ứng vật liệu xanh cho 24 doanh nghiệp thủ công
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══ CHAPTER 3: Your Impact ═══ */}
        <ScrollReveal preset="fade-up">
          <div className="text-center mb-space-3xl">
            <span className="text-label-md text-secondary uppercase tracking-widest">03 — Tác động</span>
            <h2 className="text-headline-lg text-primary font-bold mt-space-xs tracking-tight">Con số biết nói</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
            {[
              { value: impact.totalKgRecycled, label: 'kg đồ đã tái sử dụng', icon: 'recycling', color: 'text-primary' },
              { value: impact.co2SavedKg, label: 'kg CO₂ đã giảm thiểu', icon: 'cloud_off', color: 'text-secondary' },
              { value: impact.treesEquivalent, label: 'cây xanh quy đổi', icon: 'forest', color: 'text-secondary' },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-surface-container-lowest rounded-hero p-space-2xl text-center shadow-level-2 card-hover"
              >
                <span className={`material-symbols-outlined text-[36px] ${m.color} mb-space-md block`}>{m.icon}</span>
                <CountUp end={m.value} separator="." className={`text-[44px] leading-[52px] font-bold ${m.color}`} />
                <p className="text-body-md text-on-surface-variant mt-space-sm">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* ═══ CHAPTER 4: About Us ═══ */}
        <ScrollReveal preset="fade-up">
          <div className="mb-space-2xl">
            <span className="text-label-md text-secondary uppercase tracking-widest">Khởi nguồn ý tưởng</span>
            <h2 className="text-headline-lg text-primary font-bold mt-space-xs tracking-tight">Về chúng tôi</h2>
          </div>
          <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-3xl mb-space-2xl">
            Ví Xanh được sáng lập năm 2026 bởi một nhóm sinh viên với mong muốn biến hành động bảo vệ môi trường thành thói quen hằng ngày, dễ tiếp cận với mọi người. Bằng cách tích hợp công nghệ ví điểm thưởng, chúng tôi trao gửi quyền năng phục hồi tự nhiên vào tay từng cá nhân.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg mb-space-2xl">
            {[
              { value: 2026, label: 'Năm thành lập' },
              { value: 5, label: 'Thành viên nòng cốt' },
              { value: 12, label: 'Tỉnh thành lan tỏa' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="bg-surface-container-lowest rounded-card p-space-xl shadow-subtle"
              >
                <CountUp end={s.value} separator="" decimals={0} className="text-[40px] leading-[48px] font-bold text-primary" />
                <p className="text-body-md text-on-surface-variant mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Partners */}
          <div>
            <span className="text-label-md text-on-surface-variant uppercase tracking-widest mb-space-md block">Đối tác đồng hành</span>
            <div className="grid grid-cols-3 gap-space-md">
              {['GreenU', 'PANASONIC', 'EcoCorp'].map(partner => (
                <div key={partner} className="bg-surface-container-lowest rounded-card p-space-xl text-center shadow-subtle">
                  <span className="text-headline-sm text-on-surface font-bold tracking-wide">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ NEWSLETTER ═══ */}
        <ScrollReveal preset="fade-up">
          <div className="bg-primary rounded-hero p-space-3xl text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
              <span className="material-symbols-outlined text-[300px] text-on-primary">eco</span>
            </div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[32px] text-[#DCEEDF] mb-space-md block">mail</span>
              <h2 className="text-headline-lg text-on-primary font-bold tracking-tight mb-space-sm">
                Cùng viết tiếp câu chuyện xanh của bạn
              </h2>
              <p className="text-body-md text-[#DCEEDF]/80 max-w-lg mx-auto mb-space-2xl">
                Nhận bản tin tác động định kỳ, số liệu rác thải đã xử lý và lời mời tham gia các ngày hội đổi đồ xanh sắp tới.
              </p>
              <div className="flex max-w-md mx-auto gap-space-xs">
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn..."
                  className="flex-1 h-12 px-space-lg rounded-chip bg-white/10 backdrop-blur-sm text-on-primary placeholder:text-[#DCEEDF]/50 border border-white/20 focus:border-white/40 outline-none transition-colors text-body-md"
                />
                <button className="px-space-xl h-12 rounded-chip bg-surface-container-lowest text-primary font-semibold text-label-lg hover:bg-surface-container-low transition-all active:scale-95">
                  Đăng ký
                </button>
              </div>
              <p className="text-label-sm text-[#DCEEDF]/50 mt-space-md">
                Cam kết không thư rác. Hủy đăng ký bất kỳ lúc nào.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ FOOTER CTA ═══ */}
        <ScrollReveal preset="fade-up">
          <div className="flex flex-col md:flex-row items-center justify-center gap-space-lg text-center">
            <button onClick={openTradeIn} className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5 bg-primary text-on-primary rounded-chip font-semibold text-label-lg shadow-level-2 hover:brightness-110 transition-all active:scale-95">
              Bắt đầu đổi đồ cũ
              <span className="material-symbols-outlined icon-sm">arrow_forward</span>
            </button>
            <Link to="/cua-hang" className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5 bg-surface-container-lowest text-primary rounded-chip font-semibold text-label-lg border border-outline-variant hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined icon-sm">storefront</span>
              Khám phá cửa hàng
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
