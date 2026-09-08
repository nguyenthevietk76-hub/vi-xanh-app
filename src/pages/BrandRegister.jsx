import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BrandRegister() {
  const { user, brand, loginWithGoogle, submitBrandApplication } = useAuth();
  const navigate = useNavigate();
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="max-w-content mx-auto w-full px-margin-mobile py-space-4xl text-center">
        <h2 className="text-title-lg font-bold mb-space-md">Đăng nhập để trở thành đối tác</h2>
        <p className="text-body-md text-on-surface-variant mb-space-lg">
          Bạn cần đăng nhập bằng Google trước khi đăng ký làm brand.
        </p>
        <button onClick={loginWithGoogle} className="px-space-xl py-space-sm bg-primary text-on-primary rounded-input font-bold">
          Đăng nhập với Google
        </button>
      </div>
    );
  }

  if (brand?.status === 'pending') {
    return (
      <div className="max-w-content mx-auto w-full px-margin-mobile py-space-4xl text-center">
        <span className="material-symbols-outlined text-[48px] text-sunlit-ochre-text mb-space-md block">hourglass_top</span>
        <h2 className="text-title-lg font-bold mb-space-sm">Hồ sơ của bạn đang chờ duyệt</h2>
        <p className="text-body-md text-on-surface-variant">
          "{brand.brandName}" đã được gửi. Admin sẽ duyệt trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  if (brand?.status === 'approved') {
    return (
      <div className="max-w-content mx-auto w-full px-margin-mobile py-space-4xl text-center">
        <h2 className="text-title-lg font-bold mb-space-md">Brand của bạn đã được duyệt 🎉</h2>
        <button onClick={() => navigate('/brand/dashboard')} className="px-space-xl py-space-sm bg-primary text-on-primary rounded-input font-bold">
          Vào bảng điều khiển Brand
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) { setError('Vui lòng nhập tên brand.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitBrandApplication({ brandName: brandName.trim(), description: description.trim() });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto w-full px-margin-mobile py-space-3xl">
      <h2 className="text-title-lg font-bold mb-space-xs">Đăng ký trở thành đối tác Brand</h2>
      <p className="text-body-md text-on-surface-variant mb-space-xl">
        Sau khi được admin duyệt, bạn có thể tự do đăng sản phẩm lên Ví Xanh mà không cần duyệt lại từng sản phẩm.
      </p>

      {brand?.status === 'rejected' && (
        <div className="mb-space-lg p-space-md bg-red-50 border border-red-200 rounded-card text-body-sm text-red-700">
          Hồ sơ trước đó chưa được duyệt. Bạn có thể chỉnh sửa và gửi lại.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-space-lg">
        <div>
          <label className="block text-label-lg font-semibold mb-space-xs">Tên Brand</label>
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="VD: EcoLife Việt Nam"
            className="w-full h-11 px-space-md bg-surface-container-lowest border border-outline-variant rounded-input text-body-md"
          />
        </div>
        <div>
          <label className="block text-label-lg font-semibold mb-space-xs">Giới thiệu ngắn</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Brand của bạn kinh doanh sản phẩm gì, sứ mệnh xanh ra sao..."
            className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-input text-body-md resize-none"
          />
        </div>
        {error && <p className="text-body-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-primary text-on-primary rounded-input font-bold text-label-lg disabled:opacity-60"
        >
          {submitting ? 'Đang gửi...' : 'Gửi hồ sơ đăng ký'}
        </button>
      </form>
    </div>
  );
}
