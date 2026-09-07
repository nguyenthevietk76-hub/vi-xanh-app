import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-high border-t border-outline-variant/30 py-space-3xl hidden md:block">
      <div className="max-w-content mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-lg text-center md:text-left">
        <div className="text-on-surface-variant text-body-sm">
          © 2026 Ví Xanh. Bản quyền được bảo lưu. Đổi hành động xanh, nhận giá trị thật.
        </div>
        <div className="flex items-center gap-space-lg text-on-surface-variant text-label-md">
          <Link to="#" className="hover:text-primary transition-colors">Điều khoản</Link>
          <span className="text-outline-variant">•</span>
          <Link to="#" className="hover:text-primary transition-colors">Liên hệ</Link>
          <span className="text-outline-variant">•</span>
          <Link to="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</Link>
        </div>
      </div>
    </footer>
  );
}
