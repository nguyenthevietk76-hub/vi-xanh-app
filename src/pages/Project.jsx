import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import CountUp from '../components/CountUp';
import ProcessModal from '../components/ProcessModal';
import { PROJECT_INFO } from '../data/projectInfo';
import { TRADE_IN_RATES, CO2_FACTOR, POINT_VALUE_VND, DISCOUNT_RULE_TEXT } from '../lib/points';

const fmtNumber = (n) => n.toLocaleString('vi-VN');

export default function Project() {
  const { openTradeIn } = useApp();
  const heroRef = useRef(null);
  // Bảng quy trình xử lý quần áo & bã cà phê (minh bạch hoá đường đi của đồ thu gom)
  const [processOpen, setProcessOpen] = useState(false);
  const openProcess = useCallback(() => setProcessOpen(true), []);
  const closeProcess = useCallback(() => setProcessOpen(false), []);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const { collectedKg, pilotTargetKg, collectionPoints, pilotCities } = PROJECT_INFO;
  const hasProgress = typeof collectedKg === 'number';
  const progressPct = hasProgress ? Math.min(100, Math.round((collectedKg / pilotTargetKg) * 100)) : 0;

  return (
    <div className="flex flex-col w-full">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative w-full min-h-screen -mt-20 overflow-hidden bg-[#0d2018] flex items-center justify-center">
        {/* Looping background video */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {/* Video: "Volunteers Folding Clothes" — Julia M Cameron, Pexels (giấy phép Pexels, dùng miễn phí) */}
          <video
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/hero-thu-gom.mp4"
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
            <span className="material-symbols-outlined icon-sm">school</span>
            Dự án khởi nghiệp sinh viên · Thí điểm {PROJECT_INFO.foundedYear}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-[28px] leading-[36px] xs:text-[34px] xs:leading-[42px] sm:text-display-lg md:text-[56px] md:leading-[64px] font-bold tracking-tight max-w-4xl mx-auto"
          >
            Cho quần áo cũ và bã cà phê một vòng đời mới
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-space-md sm:mt-space-xl text-body-sm sm:text-body-lg text-surface-container-low/85 max-w-2xl mx-auto leading-relaxed"
          >
            Ví Xanh nhận quần áo cũ và bã cà phê, quy đổi thành điểm xanh để bạn đổi lấy sản phẩm bền vững.
            Chúng tôi bắt đầu từ quy mô nhỏ và công khai cách làm ở từng bước.
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
            <button
              onClick={openProcess}
              className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                         bg-white/20 hover:bg-white/25 border border-white/30 text-surface-container-lowest rounded-chip
                         font-semibold text-label-lg backdrop-blur-sm transition-all w-full sm:w-auto"
            >
              <span className="material-symbols-outlined icon-sm">account_tree</span>
              Quy trình xử lý
            </button>
            <a href="#progress" className="inline-flex items-center justify-center gap-space-xs px-space-2xl py-3.5
                     bg-white/20 hover:bg-white/25 border border-white/30 text-surface-container-lowest rounded-chip
                     font-semibold text-label-lg backdrop-blur-sm transition-all w-full sm:w-auto">
              Xem tiến độ
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

      {/* ═══ PROGRESS — mục tiêu thí điểm ═══ */}
      <div id="progress" className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop -mt-10 sm:-mt-14 relative z-20">
        <ScrollReveal preset="fade-up">
          <div className="bg-surface-container-lowest rounded-card sm:rounded-hero p-4 sm:p-space-2xl shadow-level-2">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Mục tiêu đợt thí điểm</span>
              </div>
              <span className="text-label-md text-on-surface-variant">{PROJECT_INFO.stage}</span>
            </div>
            <h3 className="text-headline-sm sm:text-headline-md text-primary font-bold mb-space-md">
              Thu gom {fmtNumber(pilotTargetKg)} kg quần áo cũ và bã cà phê đầu tiên
            </h3>
            <div className="h-3 bg-surface-container-high rounded-chip overflow-hidden mb-space-sm">
              {hasProgress && (
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  viewport={{ once: true }}
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-chip"
                />
              )}
            </div>
            <div className="flex justify-between gap-space-md text-body-sm text-on-surface-variant">
              {hasProgress ? (
                <>
                  <span><strong className="text-primary">{fmtNumber(collectedKg)} kg</strong> đã thu gom · {progressPct}% mục tiêu</span>
                  <span>Còn {fmtNumber(Math.max(0, pilotTargetKg - collectedKg))} kg</span>
                </>
              ) : (
                <span>Số liệu thu gom thực tế đang được cập nhật và sẽ công bố sau đợt thu gom đầu tiên.</span>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-4xl space-y-space-4xl">
        {/* ═══ CHAPTER 1: Vấn đề ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-3xl items-center">
          <ScrollReveal preset="fade-left">
            <div className="bg-surface-container-low rounded-hero p-space-2xl">
              <div className="flex items-center gap-space-xs mb-space-xl">
                <span className="px-3 py-1 rounded-chip bg-surface-container-high text-on-surface-variant text-label-md font-semibold">Điểm thu gom thí điểm</span>
                <span className="material-symbols-outlined icon-md text-on-surface-variant">location_on</span>
              </div>
              <div className="grid grid-cols-2 gap-space-md mb-space-xl">
                <div className="bg-surface-container rounded-card p-space-lg">
                  <CountUp end={collectionPoints.length} className="text-[40px] leading-[48px] font-bold text-primary" />
                  <p className="text-body-sm text-on-surface-variant mt-1">Điểm nhận đồ đang thử nghiệm</p>
                </div>
                <div className="bg-surface-container rounded-card p-space-lg">
                  <CountUp end={PROJECT_INFO.acceptedItems.length} className="text-[40px] leading-[48px] font-bold text-secondary" />
                  <p className="text-body-sm text-on-surface-variant mt-1">Loại đồ tiếp nhận: {PROJECT_INFO.acceptedItems.join(' & ').toLowerCase()}</p>
                </div>
              </div>
              <ul className="space-y-space-xs">
                {collectionPoints.map(p => (
                  <li key={p.name} className="flex items-start gap-space-xs text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined icon-sm text-secondary shrink-0">pin_drop</span>
                    <span><strong className="text-on-surface">{p.name}</strong> — {p.address}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal preset="fade-right" delay={0.15}>
            <div>
              <span className="text-label-md text-secondary uppercase tracking-widest">01 — Vấn đề</span>
              <h2 className="text-headline-lg text-primary font-bold mt-space-xs mb-space-md tracking-tight">Đồ còn giá trị nhưng bị bỏ đi</h2>
              <p className="text-body-lg text-on-surface-variant leading-relaxed mb-space-md">
                Nhiều quần áo cũ vẫn còn mặc được nhưng bị cất kho rồi bỏ chung với rác sinh hoạt. Bã cà phê từ các quán
                và gia đình phần lớn bị đổ bỏ mỗi ngày, dù vẫn có thể ủ phân hoặc làm nguyên liệu.
              </p>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Điều còn thiếu là một cách đơn giản để gom lại, phân loại và có lý do để mọi người làm điều đó thường xuyên.
                Ví Xanh thử giải bài toán này bằng điểm thưởng.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══ CHAPTER 2: Giải pháp ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-3xl items-center">
          <ScrollReveal preset="fade-left" delay={0.1} className="order-2 lg:order-1">
            <span className="text-label-md text-secondary uppercase tracking-widest">02 — Giải pháp</span>
            <h2 className="text-headline-lg text-primary font-bold mt-space-xs mb-space-md tracking-tight">Phân loại, rồi dùng lại trước — tái chế sau</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed mb-space-xl">
              Đồ bạn mang đến được cân lại và phân loại theo chất lượng. Quần áo còn tốt được trao tay người dùng mới hoặc
              may lại thành sản phẩm khác; phần không dùng lại được đưa đi tái chế. Bã cà phê được sấy khô để ủ phân hoặc
              làm sản phẩm thủ công. Bạn nhận điểm theo cân thực tế và bảng quy đổi công khai.
            </p>
            <button
              onClick={openProcess}
              className="inline-flex items-center gap-space-xs px-space-xl py-3 bg-primary text-on-primary rounded-chip font-semibold text-label-lg hover:bg-secondary transition-colors shadow-subtle"
            >
              <span className="material-symbols-outlined icon-sm">account_tree</span>
              Xem quy trình xử lý quần áo & bã cà phê
            </button>
          </ScrollReveal>

          <ScrollReveal preset="fade-right" delay={0.15} className="order-1 lg:order-2">
            <div className="bg-secondary-fixed/50 rounded-hero p-space-2xl">
              <div className="flex items-center gap-space-xs mb-space-xl">
                <span className="px-3 py-1 rounded-chip bg-surface-container-lowest text-on-surface-variant text-label-md font-semibold">Đầu ra dự kiến</span>
                <span className="material-symbols-outlined icon-md text-secondary">autorenew</span>
              </div>
              <div className="space-y-space-md">
                {[
                  { icon: 'checkroom', from: 'Quần áo cũ', to: 'Dùng lại · may lại · tái chế sợi' },
                  { icon: 'coffee', from: 'Bã cà phê', to: 'Phân compost · sản phẩm thủ công' },
                ].map(r => (
                  <div key={r.from} className="bg-surface-container-lowest rounded-card p-space-lg flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[28px] text-primary shrink-0">{r.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface">{r.from}</p>
                      <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-secondary">arrow_forward</span>
                        {r.to}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="flex items-start gap-space-xs text-body-sm text-on-surface-variant mt-space-lg">
                <span className="material-symbols-outlined icon-sm text-secondary shrink-0">handshake</span>
                Chúng tôi đang tìm các xưởng may, nhóm thủ công và quán cà phê cùng tham gia thí điểm.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══ CHAPTER 3: Đo tác động minh bạch ═══ */}
        <ScrollReveal preset="fade-up">
          <div className="text-center mb-space-3xl max-w-2xl mx-auto">
            <span className="text-label-md text-secondary uppercase tracking-widest">03 — Tác động</span>
            <h2 className="text-headline-lg text-primary font-bold mt-space-xs tracking-tight">Chúng tôi đo tác động như thế nào</h2>
            <p className="text-body-md text-on-surface-variant mt-space-sm">
              Mọi con số trong Ví Xanh đều tính từ số kg thực tế đã cân tại điểm thu gom, theo các hệ số dưới đây.
              Số liệu tổng của dự án sẽ được công bố sau mỗi đợt thu gom.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
            {[
              { icon: 'checkroom', title: '1 kg quần áo', value: `≈ ${String(CO2_FACTOR.clothes_a).replace('.', ',')} kg CO₂`, note: `giảm được (ước tính) · ${TRADE_IN_RATES.filter(r => r.id.startsWith('clothes')).map(r => r.rate).join(' / ')} điểm theo loại A / B / C` },
              { icon: 'coffee', title: '1 kg bã cà phê', value: `≈ ${String(CO2_FACTOR.coffee).replace('.', ',')} kg CO₂`, note: `giảm được (ước tính) · ${TRADE_IN_RATES.find(r => r.id === 'coffee')?.rate} điểm` },
              { icon: 'eco', title: '1 điểm xanh', value: `≈ ${fmtNumber(POINT_VALUE_VND)}đ`, note: `giảm giá khi mua (${DISCOUNT_RULE_TEXT}) hoặc đổi quà độc quyền` },
            ].map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-surface-container-lowest rounded-hero p-space-2xl text-center shadow-level-2 card-hover"
              >
                <span className="material-symbols-outlined text-[36px] text-secondary mb-space-md block">{m.icon}</span>
                <p className="text-body-md text-on-surface-variant">{m.title}</p>
                <p className="text-headline-md font-bold text-primary my-space-xs">{m.value}</p>
                <p className="text-body-sm text-on-surface-variant">{m.note}</p>
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
            Ví Xanh được bắt đầu năm {PROJECT_INFO.foundedYear} bởi một nhóm sinh viên. Chúng tôi muốn thử xem liệu một chiếc ví
            điểm thưởng có giúp việc mang quần áo cũ và bã cà phê đi tái sử dụng trở thành thói quen hằng ngày hay không.
            Dự án đang ở {PROJECT_INFO.stage.toLowerCase()}: còn nhỏ, còn nhiều điều phải học, và chúng tôi chia sẻ công khai
            những gì mình làm được.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg mb-space-2xl">
            {[
              { value: PROJECT_INFO.foundedYear, label: 'Năm bắt đầu' },
              { value: PROJECT_INFO.coreMembers, label: 'Thành viên nòng cốt' },
              { value: pilotCities.length, label: `Thành phố thí điểm (${pilotCities.join(', ')})` },
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

          {/* Partners — mời hợp tác thay vì liệt kê đối tác chưa có */}
          <div className="bg-surface-container-lowest rounded-hero p-space-xl sm:p-space-2xl shadow-subtle flex flex-col md:flex-row md:items-center gap-space-lg">
            <div className="flex-1">
              <span className="text-label-md text-on-surface-variant uppercase tracking-widest block mb-space-xs">Tìm kiếm đối tác đồng hành</span>
              <p className="text-body-md text-on-surface-variant">
                Bạn là quán cà phê, xưởng may, nhóm thủ công hay thương hiệu sản phẩm xanh? Hãy cùng chúng tôi thử nghiệm mô hình
                ngay từ những bước đầu tiên.
              </p>
            </div>
            <Link
              to="/brand/dang-ky"
              className="inline-flex items-center justify-center gap-space-xs px-space-xl py-3 bg-primary text-on-primary rounded-chip font-semibold text-label-lg hover:bg-secondary transition-colors shrink-0"
            >
              <span className="material-symbols-outlined icon-sm">handshake</span>
              Trở thành đối tác
            </Link>
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
                Nhận cập nhật tiến độ dự án, số liệu sau mỗi đợt thu gom và lịch các buổi nhận đồ sắp tới.
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
      <ProcessModal open={processOpen} onClose={closeProcess} />
    </div>
  );
}
