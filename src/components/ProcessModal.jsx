import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTradeInRate } from '../lib/points';

/* ══════════════════════════════════════════
   QUY TRÌNH XỬ LÝ — minh bạch hoá đường đi của đồ thu gom
   Điểm/kg lấy trực tiếp từ src/lib/points.js để luôn khớp với bảng quy đổi.
   ══════════════════════════════════════════ */

const rate = (id) => getTradeInRate(id)?.rate ?? 0;

const PROCESSES = {
  clothes: {
    label: 'Quần áo cũ',
    icon: 'checkroom',
    intro: 'Mỗi món quần áo được cân, phân loại theo độ mới rồi đi theo con đường giữ được nhiều giá trị nhất: dùng lại trước, tái chế sau.',
    steps: [
      {
        icon: 'inventory_2',
        title: 'Tiếp nhận & cân tại điểm thu gom',
        short: 'Cân',
        desc: 'Bạn gửi yêu cầu trên app và mang đồ tới điểm thu gom. Nhân viên cân lại trước mặt bạn — điểm tính theo cân thực tế, không theo số khai báo.',
        app: 'Yêu cầu hiện trong Ví ở trạng thái "Chờ duyệt"',
      },
      {
        icon: 'fact_check',
        title: 'Phân loại theo độ mới',
        short: 'Phân loại',
        desc: 'Từng món được kiểm tra vết rách, ố bẩn, độ bền vải và xếp vào 1 trong 3 loại. Loại quyết định điểm bạn nhận và con đường xử lý tiếp theo.',
        app: 'Loại cuối cùng & số kg thực tế được ghi vào yêu cầu',
        grades: [
          { id: 'clothes_a', tone: 'a', name: 'Loại A', cond: 'Còn mới ≥ 80%', dest: 'Tái sử dụng', destDesc: 'Trao tặng hoặc bán lại dạng đồ secondhand', icon: 'volunteer_activism' },
          { id: 'clothes_b', tone: 'b', name: 'Loại B', cond: 'Còn dùng tốt 50–79%', dest: 'Tái chế sáng tạo', destDesc: 'Cắt may lại thành túi, khăn, đồ thủ công', icon: 'content_cut' },
          { id: 'clothes_c', tone: 'c', name: 'Loại C', cond: 'Dưới 50%', dest: 'Tái chế sợi', destDesc: 'Xé sợi làm bông nhồi, giẻ lau công nghiệp', icon: 'recycling' },
        ],
      },
      {
        icon: 'local_laundry_service',
        title: 'Làm sạch & khử khuẩn',
        short: 'Làm sạch',
        desc: 'Đồ loại A và B được giặt, sấy nhiệt và khử khuẩn trước khi sang tay người dùng mới hoặc xưởng may. Cúc, khoá kéo kim loại được tháo riêng để tái chế.',
      },
      {
        icon: 'alt_route',
        title: 'Đi theo đúng con đường',
        short: 'Chia luồng',
        desc: 'Loại A → tái sử dụng · Loại B → xưởng may tái chế sáng tạo · Loại C → cơ sở tái chế sợi. Ưu tiên luôn là kéo dài vòng đời món đồ lâu nhất có thể.',
      },
      {
        icon: 'delete_sweep',
        title: 'Phần không tái chế được',
        short: 'Phần còn lại',
        desc: 'Phần vải lẫn tạp chất, không thể tách sợi được chuyển cho đơn vị thu gom rác có giấy phép để xử lý đúng quy định — chúng tôi không hứa "không rác thải" khi chưa làm được.',
      },
      {
        icon: 'account_balance_wallet',
        title: 'Cộng điểm & ghi nhận tác động',
        short: 'Cộng điểm',
        desc: 'Sau khi duyệt, điểm được cộng vào ví cùng thông báo. Lượng CO₂ giảm được ước tính khoảng 1,6 kg CO₂ cho mỗi kg quần áo được tái sử dụng/tái chế.',
        app: 'Trạng thái chuyển "Đã duyệt" + thông báo "+X điểm xanh"',
      },
    ],
    outputs: ['Đồ secondhand', 'Túi & khăn may lại', 'Bông nhồi', 'Giẻ lau công nghiệp'],
  },
  coffee: {
    label: 'Bã cà phê',
    icon: 'coffee',
    intro: 'Bã cà phê còn giàu dinh dưỡng và tinh dầu. Thay vì bị đổ bỏ và phân huỷ sinh khí mê-tan ở bãi rác, bã được sấy khô và biến thành nguyên liệu mới.',
    steps: [
      {
        icon: 'inventory_2',
        title: 'Tiếp nhận & cân',
        short: 'Cân',
        desc: `Nhận bã đã để khô, không lẫn giấy lọc, túi ni-lông hay thức ăn thừa. Cân tại điểm thu gom, quy đổi ${rate('coffee')} điểm/kg.`,
        app: 'Yêu cầu hiện trong Ví ở trạng thái "Chờ duyệt"',
      },
      {
        icon: 'filter_alt',
        title: 'Sàng lọc tạp chất',
        short: 'Sàng lọc',
        desc: 'Bã được sàng để loại bỏ giấy lọc, vỏ nang, rác lẫn. Mẻ bị mốc hoặc lẫn quá nhiều tạp chất được tách riêng và không dùng để chế biến.',
      },
      {
        icon: 'wb_sunny',
        title: 'Sấy khô',
        short: 'Sấy khô',
        desc: 'Bã được phơi hoặc sấy tới độ ẩm thấp để chống nấm mốc và bảo quản được lâu trước khi đưa vào chế biến.',
      },
      {
        icon: 'science',
        title: 'Chế biến thành nguyên liệu mới',
        short: 'Chế biến',
        desc: 'Tuỳ chất lượng từng mẻ, bã được ủ thành phân compost hữu cơ, làm giá thể trồng nấm, hoặc phối trộn làm sản phẩm như xà phòng tẩy da chết, nến thơm, viên nén đốt.',
      },
      {
        icon: 'storefront',
        title: 'Quay lại cuộc sống',
        short: 'Lên kệ',
        desc: 'Một phần sản phẩm làm từ bã cà phê được đưa lên Cửa hàng Ví Xanh — chính điểm bạn tích được có thể đổi lấy chúng, khép kín vòng tuần hoàn.',
      },
      {
        icon: 'account_balance_wallet',
        title: 'Cộng điểm & ghi nhận tác động',
        short: 'Cộng điểm',
        desc: 'Sau khi duyệt, điểm được cộng vào ví. Lượng CO₂ giảm được ước tính khoảng 0,5 kg CO₂ cho mỗi kg bã cà phê không phải chôn lấp.',
        app: 'Trạng thái chuyển "Đã duyệt" + thông báo "+X điểm xanh"',
      },
    ],
    outputs: ['Phân compost', 'Giá thể trồng nấm', 'Xà phòng & nến', 'Viên nén đốt'],
  },
};

const COMMITMENTS = [
  { icon: 'scale', title: 'Cân lại tại chỗ', text: 'Điểm theo số kg cân thực tế' },
  { icon: 'table_chart', title: 'Bảng điểm công khai', text: 'Tính đúng bảng quy đổi' },
  { icon: 'track_changes', title: 'Theo dõi trong Ví', text: 'Xem trạng thái từng yêu cầu' },
];

// Màu nhấn cho 3 loại quần áo (A tốt nhất → C)
const GRADE_TONE = {
  a: { bar: 'bg-leaf-green', pill: 'bg-eco-tint text-leaf-green', icon: 'text-leaf-green' },
  b: { bar: 'bg-[#D9A441]', pill: 'bg-sunlit-ochre/30 text-sunlit-ochre-text', icon: 'text-sunlit-ochre-text' },
  c: { bar: 'bg-coral-mist-text/60', pill: 'bg-coral-mist text-coral-mist-text', icon: 'text-coral-mist-text' },
};

export default function ProcessModal({ open, onClose, initialTab = 'clothes' }) {
  const [tab, setTab] = useState(initialTab);
  const closeRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, initialTab, onClose]);

  const switchTab = (id) => {
    setTab(id);
    bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const process = PROCESSES[tab];

  // Render ra thẳng <body> để không bị thanh điều hướng hay hiệu ứng chuyển trang che/lệch vị trí
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="process-title"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative z-10 w-full sm:max-w-3xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col bg-surface-container-lowest rounded-t-[28px] sm:rounded-hero shadow-level-3 overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="shrink-0 bg-gradient-to-b from-eco-tint/70 to-surface-container-lowest px-5 sm:px-8 pt-3 sm:pt-6 pb-4 border-b border-outline-variant/30">
              {/* Tay nắm kéo (mobile) */}
              <div aria-hidden className="sm:hidden mx-auto mb-3 h-1.5 w-10 rounded-full bg-outline-variant" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-label-sm text-leaf-green uppercase tracking-widest font-bold">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Minh bạch từ A → Z
                  </span>
                  <h2 id="process-title" className="text-headline-sm sm:text-headline-md text-primary font-bold mt-0.5">Quy trình xử lý</h2>
                </div>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface-variant shrink-0 transition-colors"
                  aria-label="Đóng"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div role="tablist" aria-label="Loại đồ" className="mt-4 grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-full border border-outline-variant/30">
                {Object.entries(PROCESSES).map(([id, p]) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => switchTab(id)}
                      className="relative h-11 rounded-full flex items-center justify-center gap-1.5 text-label-lg font-semibold"
                    >
                      {active && (
                        <motion.span
                          layoutId="process-tab-pill"
                          className="absolute inset-0 rounded-full bg-primary shadow-subtle"
                          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        />
                      )}
                      <span className={`relative flex items-center gap-1.5 transition-colors ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Body (cuộn) ── */}
            <div ref={bodyRef} className="flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="px-5 sm:px-8 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                >
                  <p className="text-body-md sm:text-body-lg text-on-surface-variant leading-relaxed">{process.intro}</p>

                  {/* Tổng quan hành trình */}
                  <ol aria-label="Tóm tắt các bước" className="mt-5 -mx-5 sm:mx-0 px-5 sm:px-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {process.steps.map((step, i) => (
                      <li key={step.title} className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-label-sm font-semibold text-on-surface">
                          <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                          {step.short || step.title}
                        </span>
                        {i < process.steps.length - 1 && (
                          <span aria-hidden className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                        )}
                      </li>
                    ))}
                  </ol>

                  {/* Timeline chi tiết */}
                  <ol className="mt-7">
                    {process.steps.map((step, i) => {
                      const last = i === process.steps.length - 1;
                      return (
                        <li key={step.title} className="relative flex gap-4 sm:gap-5 pb-7 last:pb-0">
                          {!last && <span aria-hidden className="absolute left-[21px] sm:left-[23px] top-12 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-leaf-green/40 to-outline-variant/30" />}
                          <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-eco-tint text-leaf-green flex items-center justify-center ring-4 ring-surface-container-lowest">
                            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">{step.icon}</span>
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center ring-2 ring-surface-container-lowest">{i + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-title-md sm:text-title-lg font-bold text-on-surface leading-snug">{step.title}</h3>
                            <p className="text-body-sm sm:text-body-md text-on-surface-variant leading-relaxed mt-1">{step.desc}</p>

                            {step.grades && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                {step.grades.map(g => {
                                  const tone = GRADE_TONE[g.tone] || GRADE_TONE.a;
                                  return (
                                    <div key={g.id} className="relative overflow-hidden rounded-card bg-surface-container-lowest border border-outline-variant/50 shadow-subtle p-4 pt-5">
                                      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} />
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-title-md font-bold text-on-surface">{g.name}</span>
                                        <span className={`text-label-sm font-bold px-2 py-0.5 rounded-full ${tone.pill}`}>{rate(g.id)} điểm/kg</span>
                                      </div>
                                      <p className="text-label-sm text-on-surface-variant mt-0.5">{g.cond}</p>
                                      <div className="mt-3 pt-3 border-t border-dashed border-outline-variant/60">
                                        <p className={`flex items-center gap-1.5 text-label-md font-bold ${tone.icon}`}>
                                          <span className="material-symbols-outlined text-[18px]">{g.icon}</span>
                                          {g.dest}
                                        </p>
                                        <p className="text-label-sm text-on-surface-variant mt-0.5 leading-snug">{g.destDesc}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {step.app && (
                              <p className="mt-3 inline-flex items-start gap-1.5 text-label-sm font-medium text-leaf-green bg-eco-tint/60 px-2.5 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-[16px] shrink-0">smartphone</span>
                                <span>Trong app: {step.app}</span>
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Đầu ra */}
                  <div className="mt-8 rounded-card bg-gradient-to-br from-eco-tint to-secondary-fixed/60 p-5">
                    <p className="text-label-lg font-bold text-primary mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[20px]">autorenew</span>
                      {process.label} của bạn có thể trở thành
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {process.outputs.map(o => (
                        <span key={o} className="px-3 py-1.5 rounded-full bg-surface-container-lowest/90 text-label-md font-semibold text-on-surface shadow-subtle">{o}</span>
                      ))}
                    </div>
                  </div>

                  {/* Cam kết */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COMMITMENTS.map(c => (
                      <div key={c.title} className="flex items-center sm:items-start gap-3 rounded-card border border-outline-variant/40 p-3.5">
                        <span className="w-9 h-9 rounded-xl bg-eco-tint text-leaf-green flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-label-md font-bold text-on-surface">{c.title}</span>
                          <span className="block text-label-sm text-on-surface-variant">{c.text}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-[11px] text-on-surface-variant/80 leading-relaxed">
                    Số liệu CO₂ là ước tính để tham khảo. Con đường xử lý cụ thể của từng mẻ phụ thuộc chất lượng thực tế khi phân loại.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
