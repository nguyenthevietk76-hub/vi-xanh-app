import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function PurchaseModal() {
  const { purchaseModalProduct, closePurchaseModal, buyProduct, user } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || 'Nguyễn Minh Anh',
    phone: '0912 345 678',
    address: '144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!purchaseModalProduct) return null;

  const product = purchaseModalProduct;
  const unitPrice = product.priceVND || 0;
  const totalPrice = unitPrice * quantity;
  // Calculate reward green points: ~5% value, min 20 points
  const bonusPoints = Math.max(20, Math.round((totalPrice * 0.05) / 100) * 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(async () => {
      await buyProduct({
        product,
        quantity,
        customerInfo,
        paymentMethod,
        bonusPoints,
      });
      setIsSubmitting(false);
      setQuantity(1);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePurchaseModal}
          className="fixed inset-0 bg-primary/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative bg-surface-container-lowest rounded-hero shadow-level-3 w-full max-w-lg max-h-[92vh] overflow-y-auto z-10 border border-outline-variant/30 flex flex-col"
        >
          {/* Header */}
          <div className="p-space-xl border-b border-outline-variant/30 flex items-center justify-between sticky top-0 bg-surface-container-lowest/95 backdrop-blur-md z-10">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[24px]">shopping_bag</span>
              <h3 className="text-title-lg text-primary font-bold">Đặt Mua Sản Phẩm</h3>
            </div>
            <button
              onClick={closePurchaseModal}
              className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-space-xl space-y-space-xl">
            {/* Product Summary */}
            <div className="flex gap-space-md p-space-md bg-surface-container-low rounded-card border border-outline-variant/40">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-nested aspect-square bg-surface-container shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-label-sm text-secondary font-semibold uppercase">{product.category}</span>
                <h4 className="text-title-md font-semibold text-on-surface truncate">{product.name}</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-title-md text-primary font-bold">
                    {unitPrice.toLocaleString('vi-VN')}đ
                  </span>
                  {product.priceOriginal && (
                    <span className="text-body-sm text-on-surface-variant line-through">
                      {product.priceOriginal.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  Kho: còn {product.stock} sản phẩm
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-surface-container-low p-space-md rounded-nested">
              <span className="text-label-lg text-on-surface font-semibold">Số lượng mua:</span>
              <div className="flex items-center gap-3 bg-surface-container-lowest px-2 py-1 rounded-nested border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full hover:bg-surface-container-low flex items-center justify-center text-primary font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="w-8 text-center font-bold text-title-md text-on-surface">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="w-8 h-8 rounded-full hover:bg-surface-container-low flex items-center justify-center text-primary font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Green Points Bonus Banner */}
            <div className="bg-primary-container/70 border border-leaf-green/30 rounded-card p-space-md flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]">eco</span>
              </div>
              <div>
                <p className="text-label-md font-bold text-primary">
                  Tặng ngay +{bonusPoints} Điểm Xanh
                </p>
                <p className="text-label-sm text-primary/80">
                  Tích lũy vào ví của bạn để đổi quà và voucher tái chế tuần hoàn.
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-space-sm">
              <h5 className="text-label-lg font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">local_shipping</span>
                Thông tin nhận hàng
              </h5>
              <div className="space-y-space-xs">
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Họ và tên người nhận</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-nested px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-nested px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Địa chỉ giao hàng</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-nested px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-space-sm">
              <h5 className="text-label-lg font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
                Phương thức thanh toán
              </h5>
              <div className="grid grid-cols-3 gap-space-xs">
                {[
                  { id: 'COD', label: 'COD (Khi nhận)', icon: 'local_atm' },
                  { id: 'VIETQR', label: 'VietQR / CK', icon: 'qr_code_2' },
                  { id: 'MOMO', label: 'Ví MoMo', icon: 'account_balance_wallet' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-2.5 rounded-nested border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === pm.id
                        ? 'border-primary bg-primary-container/40 text-primary font-bold'
                        : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{pm.icon}</span>
                    <span className="text-label-sm">{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="border-t border-outline-variant/30 pt-space-md space-y-1.5 text-body-md text-on-surface-variant">
              <div className="flex justify-between">
                <span>Tạm tính ({quantity} sản phẩm):</span>
                <span className="font-semibold text-on-surface">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="text-leaf-green font-semibold">Miễn phí</span>
              </div>
              <div className="flex justify-between text-title-md font-bold text-primary pt-2 border-t border-dashed border-outline-variant/40">
                <span>Tổng thanh toán:</span>
                <span className="text-title-lg text-primary">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-space-md pt-space-xs">
              <button
                type="button"
                onClick={closePurchaseModal}
                className="w-1/3 h-12 rounded-input border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-low transition-colors"
              >
                Hủy
              </button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                type="submit"
                className="flex-1 h-12 bg-primary text-on-primary rounded-input font-bold text-label-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-level-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Xác nhận Mua ({totalPrice.toLocaleString('vi-VN')}đ)
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
