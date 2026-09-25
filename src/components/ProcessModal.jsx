import { useEffect, useRef, useState } from 'react';
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
        desc: 'Bạn gửi yêu cầu trên app và mang đồ tới điểm thu gom. Nhân viên cân lại trước mặt bạn — điểm tính theo cân thực tế, không theo số khai báo.',
        app: 'Yêu cầu hiện trong Ví ở trạng thái "Chờ duyệt"',
      },
      {
        icon: 'fact_check',
        title: 'Phân loại theo độ mới',
        desc: 'Từng món được kiểm tra vết rách, ố bẩn, độ bền vải và xếp vào 1 trong 3 loại. Loại quyết định điểm bạn nhận và con đường xử lý tiếp theo.',
        app: 'Loại cuối cùng & số kg thực tế được ghi vào yêu cầu',
        grades: [
          { id: 'clothes_a', name: 'Loại A', cond: 'Còn mới ≥ 80%', dest: 'Tái sử dụng', destDesc: 'Trao tặng hoặc bán lại dạng đồ secondhand', icon: 'volunteer_activism' },
          { id: 'clothes_b', name: 'Loại B', cond: 'Còn dùng tốt 50–79%', dest: 'Tái chế sáng tạo', destDesc: 'Cắt may lại thành túi, khăn, đồ thủ công', icon: 'content_cut' },
          { id: 'clothes_c', name: 'Loại C', cond: 'Dưới 50%', dest: 'Tái chế sợi', destDesc: 'Xé sợi làm bông nhồi, giẻ lau công nghiệp', icon: 'recycling' },
        ],
      },
      {
        icon: 'local_laundry_service',
        title: 'Làm sạch & khử khuẩn',
        desc: 'Đồ loại A và B được giặt, sấy nhiệt và khử khuẩn trước khi sang tay người dùng mới hoặc xưởng may. Cúc, khoá kéo kim loại được tháo riêng để tái chế.',
      },
      {
        icon: 'alt_route',
        title: 'Đi theo đúng con đường',
        desc: 'Loại A → tái sử dụng · Loại B → xưởng may tái chế sáng tạo · Loại C → cơ sở tái chế sợi. Ưu tiên luôn là kéo dài vòng đời món đồ lâu nhất có thể.',
      },
      {
        icon: 'delete_sweep',
        title: 'Phần không tái chế được',
        desc: 'Phần vải lẫn tạp chất, không thể tách sợi được chuyển cho đơn vị thu gom rác có giấy phép để xử lý đúng quy định — chúng tôi không hứa "không rác thải" khi chưa làm được.',
      },
      {
        icon: 'account_balance_wallet',
        title: 'Cộng điểm & ghi nhận tác động',
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
        desc: `Nhận bã đã để khô, không lẫn giấy lọc, túi ni-lông hay thức ăn thừa. Cân tại điểm thu gom, quy đổi ${rate('coffee')} điểm/kg.`,
        app: 'Yêu cầu hiện trong Ví ở trạng thái "Chờ duyệt"',
      },
      {
        icon: 'filter_alt',
        title: 'Sàng lọc tạp chất',
        desc: 'Bã được sàng để loại bỏ giấy lọc, vỏ nang, rác lẫn. Mẻ bị mốc hoặc lẫn quá nhiều tạp chất được tách riêng và không dùng để chế biến.',
      },
      {
        icon: 'wb_sunny',
        title: 'Sấy khô',
        desc: 'Bã được phơi hoặc sấy tới độ ẩm thấp để chống nấm mốc và bảo quản được lâu trước khi đưa vào chế biến.',
      },
      {
        icon: 'science',
        title: 'Chế biến thành nguyên liệu mới',
        desc: 'Tuỳ chất lượng từng mẻ, bã được ủ thành phân compost hữu cơ, làm giá thể trồng nấm, hoặc phối trộn làm sản phẩm như xà phòng tẩy da chết, nến thơm, viên nén đốt.',
      },
      {
        icon: 'storefront',
        title: 'Quay lại cuộc sống',
        desc: 'Một phần sản phẩm làm từ bã cà phê được đưa lên Cửa hàng Ví Xanh — chính điểm bạn tích được có thể đổi lấy chúng, khép kín vòng tuần hoàn.',
      },
      {
        icon: 'account_balance_wallet',
        title: 'Cộng điểm & ghi nhận tác động',
        desc: 'Sau khi duyệt, điểm được cộng vào ví. Lượng CO₂ giảm được ước tính khoảng 0,5 kg CO₂ cho mỗi kg bã cà phê không phải chôn lấp.',
        app: 'Trạng thái chuyển "Đã duyệt" + thông báo "+X điểm xanh"',
      },
    ],
    outputs: ['Phân compost', 'Giá thể trồng nấm', 'Xà phòng & nến', 'Viên nén đốt'],
  },
};

const COMMITMENTS = [
  { icon: 'scale', text: 'Cân lại tại điểm thu gom — điểm theo cân thực tế' },
  { icon: 'table_chart', text: 'Điểm tính đúng bảng quy đổi công khai' },
  { icon: 'track_changes', text: 'Theo dõi trạng thái từng yêu cầu trong Ví' },
];

export default function ProcessModal({ open, onClose, initialTab = 'clothes' }) {
  const [tab, setTab] = useState(initialTab);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, initialTab, onClose]);

  const process = PROCESSES[tab];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-surface-container-lowest rounded-t-hero sm:rounded-hero shadow-level-3 border border-outline-variant/30"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 px-space-lg sm:px-space-xl pt-space-lg pb-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div>
                  <span className="text-label-sm text-secondary uppercase tracking-widest font-semibold">Minh bạch từ A → Z</span>
                  <h2 id="process-title" className="text-headline-sm sm:text-headline-md text-primary font-bold">Quy trình xử lý</h2>
                </div>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0"
                  aria-label="Đóng"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div role="tablist" className="mt-space-md grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-input">
                {Object.entries(PROCESSES).map(([id, p]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={`h-10 rounded-nested flex items-center justify-center gap-1.5 text-label-lg font-semibold transition-colors ${
                      tab === id ? 'bg-primary text-on-primary shadow-subtle' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="px-space-lg sm:px-space-xl py-space-xl"
            >
              <p className="text-body-md text-on-surface-variant leading-relaxed mb-space-xl">{process.intro}</p>

              {/* Timeline */}
              <ol className="relative">
                {process.steps.map((step, i) => {
                  const last = i === process.steps.length - 1;
                  return (
                    <li key={step.title} className="relative flex gap-space-md pb-space-xl last:pb-0">
                      {!last && <span aria-hidden className="absolute left-[21px] top-12 bottom-1 w-0.5 bg-gradient-to-b from-secondary/60 to-outline-variant/40" />}
                      <div className="relative shrink-0 w-11 h-11 rounded-full bg-primary-container border-2 border-secondary/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px] text-primary">{step.icon}</span>
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-title-md font-bold text-on-surface">{step.title}</h3>
                        <p className="text-body-sm sm:text-body-md text-on-surface-variant leading-relaxed mt-1">{step.desc}</p>

                        {step.grades && (
                          <div className="grid sm:grid-cols-3 gap-space-sm mt-space-md">
                            {step.grades.map(g => (
                              <div key={g.id} className="bg-surface-container-low rounded-card p-space-md border border-outline-variant/40">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-label-lg font-bold text-primary">{g.name}</span>
                                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-primary-container text-primary">{rate(g.id)} điểm/kg</span>
                                </div>
                                <p className="text-label-sm text-on-surface-variant">{g.cond}</p>
                                <div className="flex items-center gap-1 mt-space-sm pt-space-sm border-t border-dashed border-outline-variant/50 text-secondary">
                                  <span className="material-symbols-outlined text-[16px]">{g.icon}</span>
                                  <span className="text-label-md font-semibold">{g.dest}</span>
                                </div>
                                <p className="text-[11px] text-on-surface-variant mt-0.5">{g.destDesc}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {step.app && (
                          <p className="inline-flex items-center gap-1 mt-space-sm text-[12px] font-medium text-leaf-green bg-primary-container/60 px-2 py-1 rounded-nested">
                            <span className="material-symbols-outlined text-[14px]">smartphone</span>
                            Trong app: {step.app}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Outputs */}
              <div className="mt-space-2xl bg-secondary-fixed/40 rounded-card p-space-lg">
                <p className="text-label-md font-bold text-primary mb-space-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">autorenew</span>
                  {process.label} của bạn có thể trở thành
                </p>
                <div className="flex flex-wrap gap-space-xs">
                  {process.outputs.map(o => (
                    <span key={o} className="px-3 py-1.5 rounded-chip bg-surface-container-lowest text-label-md font-semibold text-on-surface">{o}</span>
                  ))}
                </div>
              </div>

              {/* Commitments */}
              <div className="mt-space-lg grid sm:grid-cols-3 gap-space-sm">
                {COMMITMENTS.map(c => (
                  <div key={c.text} className="flex items-start gap-space-xs text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">{c.icon}</span>
                    {c.text}
                  </div>
                ))}
              </div>
              <p className="mt-space-lg text-[11px] text-on-surface-variant/80">
                Số liệu CO₂ là ước tính để tham khảo. Con đường xử lý cụ thể của từng mẻ phụ thuộc chất lượng thực tế khi phân loại.
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
