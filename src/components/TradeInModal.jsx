import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { EXCHANGE_RATES, COLLECTION_POINTS } from '../data/mockData';
import Button from './Button';

const CONDITIONS = [
  { id: 'good', label: 'Còn tốt (mặc được ngay)', icon: 'thumb_up', multiplier: 1 },
  { id: 'worn', label: 'Đã cũ (sờn, phai màu)', icon: 'autorenew', multiplier: 0.8 },
  { id: 'damaged', label: 'Hư hỏng (cần rã vật liệu)', icon: 'broken_image', multiplier: 0.5 },
];

export default function TradeInModal() {
  const { tradeInModalOpen, closeTradeIn, tradeIn } = useApp();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [weight, setWeight] = useState(2);
  const [weightMode, setWeightMode] = useState('kg');
  const [condition, setCondition] = useState(null);

  if (!tradeInModalOpen) return null;

  const selectedRate = EXCHANGE_RATES.find(r => r.id === category);
  const condMult = CONDITIONS.find(c => c.id === condition)?.multiplier || 1;
  const estimatedPoints = selectedRate ? Math.round(selectedRate.rate * weight * condMult) : 0;
  const co2Saved = Math.round(weight * 1.6 * 10) / 10;

  function handleSubmit() {
    tradeIn({
      category: selectedRate?.name || '',
      weight,
      condition,
      points: estimatedPoints,
      co2Saved,
    });
    setStep(1);
    setCategory(null);
    setWeight(2);
    setCondition(null);
  }

  function resetAndClose() {
    closeTradeIn();
    setStep(1);
    setCategory(null);
    setWeight(2);
    setCondition(null);
  }

  return (
    <AnimatePresence>
      {tradeInModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] modal-backdrop flex items-end md:items-center justify-center p-0 md:p-space-2xl"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-[900px] max-h-[90vh] bg-surface-container-lowest rounded-t-hero md:rounded-hero shadow-level-3 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface-container-lowest z-10 px-space-2xl pt-space-2xl pb-space-md border-b border-outline-variant/20">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <button onClick={resetAndClose} className="text-on-surface-variant hover:text-on-surface mb-space-xs flex items-center gap-space-2xs text-body-md">
                    <span className="material-symbols-outlined icon-sm">arrow_back</span>
                    Quay lại trang chủ
                  </button>
                  <h2 className="text-headline-md text-primary font-bold">Đổi đồ cũ lấy điểm xanh</h2>
                  <p className="text-body-md text-on-surface-variant mt-1">
                    Mỗi món đồ bạn trao đi tiếp tục một vòng đời mới
                  </p>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                  <span className="material-symbols-outlined icon-lg text-on-surface-variant">close</span>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-0">
                {[1, 2, 3, 4].map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-lg font-bold transition-colors duration-300
                      ${step >= s ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {step > s ? <span className="material-symbols-outlined text-[16px]">check</span> : s}
                    </div>
                    {i < 3 && (
                      <div className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${step > s ? 'bg-primary' : 'bg-surface-container-high'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['Loại đồ', 'Thông tin', 'Điểm thu gom', 'Xác nhận'].map(label => (
                  <span key={label} className="text-label-sm text-on-surface-variant flex-1 text-center">{label}</span>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col lg:flex-row">
              {/* Main Form Area */}
              <div className="flex-1 p-space-2xl">
                <AnimatePresence mode="wait">
                  {/* Step 1: Category */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h3 className="text-title-lg text-on-surface font-semibold mb-space-xs">1. Chọn loại đồ quy đổi</h3>
                      <p className="text-body-md text-on-surface-variant mb-space-xl">Chọn đúng danh mục để hệ thống tính điểm chuẩn xác nhất</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                        {EXCHANGE_RATES.map(rate => (
                          <button
                            key={rate.id}
                            onClick={() => { setCategory(rate.id); setStep(2); }}
                            className={`p-space-xl rounded-card text-center transition-all duration-200 border-2
                              ${category === rate.id
                                ? 'border-primary bg-[#DCEEDF]'
                                : 'border-transparent bg-surface-container-low hover:bg-surface-container'
                              }`}
                          >
                            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-space-sm
                              ${category === rate.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                              <span className="material-symbols-outlined icon-lg">{rate.icon}</span>
                            </div>
                            <div className="text-title-md font-semibold text-on-surface">{rate.name}</div>
                            <div className="text-label-md text-secondary mt-1">{rate.rate} {rate.unit}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Weight & Condition */}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h3 className="text-title-lg text-on-surface font-semibold mb-space-xl">2. Khối lượng ước tính</h3>
                      <div className="bg-surface-container-low rounded-card p-space-2xl mb-space-2xl">
                        <div className="flex items-center justify-between mb-space-xl">
                          <span className="text-body-md text-on-surface-variant">Kéo thanh trượt để nhập khối lượng gần đúng</span>
                          <div className="flex gap-2">
                            {['kg', 'số lượng'].map(m => (
                              <button key={m} onClick={() => setWeightMode(m)}
                                className={`px-3 py-1 rounded-chip text-label-md font-semibold transition-colors
                                  ${weightMode === m ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                Theo {m}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="text-center mb-space-xl">
                          <span className="text-[48px] leading-[56px] font-bold text-primary tracking-tight">{weight.toFixed(1)}</span>
                          <span className="text-headline-md text-on-surface-variant ml-1">kg</span>
                        </div>
                        <input
                          type="range" min="0.5" max="20" step="0.5" value={weight}
                          onChange={(e) => setWeight(parseFloat(e.target.value))}
                          className="w-full h-2 bg-surface-container-high rounded-chip appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-2 text-label-sm text-outline">
                          <span>0.5 kg</span><span>5.0 kg</span><span>10.0 kg</span><span>15.0 kg</span><span>20.0 kg</span>
                        </div>
                      </div>

                      <h3 className="text-title-lg text-on-surface font-semibold mb-space-xs">3. Tình trạng đồ vật</h3>
                      <p className="text-body-md text-on-surface-variant mb-space-md">Giúp phân loại để tái sử dụng ngay hoặc chuyển xưởng bóc sợi tái chế</p>
                      <div className="flex flex-col sm:flex-row gap-space-md">
                        {CONDITIONS.map(cond => (
                          <button
                            key={cond.id}
                            onClick={() => setCondition(cond.id)}
                            className={`flex-1 p-space-lg rounded-card text-center transition-all duration-200 border-2
                              ${condition === cond.id
                                ? 'border-primary bg-[#DCEEDF]'
                                : 'border-transparent bg-surface-container-low hover:bg-surface-container'
                              }`}
                          >
                            <span className="material-symbols-outlined icon-lg text-on-surface-variant mb-2 block">{cond.icon}</span>
                            <span className="text-body-md font-medium">{cond.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-space-md mt-space-2xl">
                        <Button variant="ghost" onClick={() => setStep(1)}>Quay lại</Button>
                        <Button onClick={() => setStep(3)} disabled={!condition} className="flex-1">Tiếp tục</Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Collection Point */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h3 className="text-title-lg text-on-surface font-semibold mb-space-xl">Điểm thu gom gần bạn</h3>
                      <div className="space-y-space-md">
                        {COLLECTION_POINTS.map((point, i) => (
                          <div key={i} className="flex items-start gap-space-md p-space-lg bg-surface-container-low rounded-card hover:bg-surface-container transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-[#DCEEDF] flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined icon-md text-primary">{i === 0 ? 'location_on' : 'store'}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-title-md font-semibold text-on-surface">{point.name}</div>
                              <div className="text-body-sm text-on-surface-variant">{point.address}</div>
                            </div>
                            <span className="text-label-lg text-secondary font-semibold">{point.distance}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-space-md mt-space-2xl">
                        <Button variant="ghost" onClick={() => setStep(2)}>Quay lại</Button>
                        <Button onClick={() => setStep(4)} className="flex-1">Tiếp tục</Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirm */}
                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h3 className="text-title-lg text-on-surface font-semibold mb-space-xl">Xác nhận thông tin</h3>
                      <div className="bg-surface-container-low rounded-card p-space-xl space-y-space-md">
                        <div className="flex justify-between"><span className="text-on-surface-variant">Loại đồ</span><span className="font-semibold">{selectedRate?.name}</span></div>
                        <div className="flex justify-between"><span className="text-on-surface-variant">Khối lượng</span><span className="font-semibold">{weight} kg</span></div>
                        <div className="flex justify-between"><span className="text-on-surface-variant">Tình trạng</span><span className="font-semibold">{CONDITIONS.find(c => c.id === condition)?.label}</span></div>
                        <div className="border-t border-outline-variant/30 pt-space-md flex justify-between items-baseline">
                          <span className="text-on-surface-variant">Điểm xanh dự kiến</span>
                          <span className="text-headline-md text-primary font-bold">+{estimatedPoints}</span>
                        </div>
                      </div>
                      <div className="flex gap-space-md mt-space-2xl">
                        <Button variant="ghost" onClick={() => setStep(3)}>Quay lại</Button>
                        <Button onClick={handleSubmit} icon="check_circle" className="flex-1">Xác nhận gửi đồ</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Preview */}
              <div className="hidden lg:block w-[300px] border-l border-outline-variant/20 p-space-2xl">
                <div className="bg-primary rounded-hero p-space-xl relative overflow-hidden mb-space-xl">
                  <div className="absolute right-1 top-1 opacity-10">
                    <span className="material-symbols-outlined text-[60px] text-on-primary">eco</span>
                  </div>
                  <div className="relative z-10">
                    <span className="text-label-md text-[#DCEEDF] uppercase tracking-wider font-semibold">Điểm xanh dự kiến</span>
                    <div className="text-[40px] leading-[48px] font-bold text-on-primary mt-space-xs">+{estimatedPoints}</div>
                    <span className="text-body-md text-[#DCEEDF]">điểm</span>
                    <p className="text-body-sm text-[#DCEEDF]/70 mt-space-md">
                      Tương đương giảm khoảng <strong className="text-on-primary">{co2Saved} kg CO₂</strong> thải ra môi trường
                    </p>
                  </div>
                </div>

                <div className="space-y-space-md">
                  <h4 className="text-title-md font-semibold flex items-center gap-space-xs">
                    <span className="material-symbols-outlined icon-sm text-secondary">swap_vert</span>
                    Tỷ lệ quy đổi điểm
                  </h4>
                  {EXCHANGE_RATES.map(rate => (
                    <div key={rate.id} className={`flex justify-between text-body-md p-space-sm rounded-nested transition-colors
                      ${category === rate.id ? 'bg-[#DCEEDF] font-semibold' : ''}`}>
                      <span className="flex items-center gap-space-xs">
                        <span className={`w-2 h-2 rounded-full ${category === rate.id ? 'bg-primary' : 'bg-outline-variant'}`} />
                        {rate.name}
                      </span>
                      <span className="font-semibold">{rate.rate} {rate.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
