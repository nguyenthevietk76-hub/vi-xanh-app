import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function UserMenu() {
  const { user, brand, isAdmin, loginWithGoogle, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={loginWithGoogle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-space-lg sm:py-space-xs bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container-low rounded-chip text-label-sm sm:text-label-lg font-semibold transition-all shadow-subtle shrink-0"
        title="Đăng nhập Google"
      >
        <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.6 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
        <span className="hidden xs:inline">Đăng nhập</span>
      </button>
    );
  }

  const menuItems = [];
  if (isAdmin) {
    menuItems.push({ label: 'Trang quản trị', icon: 'admin_panel_settings', onClick: () => navigate('/admin') });
  }
  if (brand?.status === 'approved') {
    menuItems.push({ label: 'Bảng điều khiển Brand', icon: 'storefront', onClick: () => navigate('/brand/dashboard') });
  } else if (brand?.status === 'pending') {
    menuItems.push({ label: 'Hồ sơ Brand (chờ duyệt)', icon: 'hourglass_empty', onClick: () => navigate('/brand/dang-ky') });
  } else {
    menuItems.push({ label: 'Trở thành đối tác', icon: 'handshake', onClick: () => navigate('/brand/dang-ky') });
  }

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setNotifOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-space-xs">
      {/* P1-3: Nút chuông thông báo */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen(o => !o); setMenuOpen(false); }}
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Thông báo"
          aria-label="Thông báo"
        >
          <span className="material-symbols-outlined text-[20px] sm:text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 bg-red-500 text-white rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-subtle animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown danh sách thông báo */}
        {notifOpen && (
          <div className="absolute right-[-40px] sm:right-0 mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-card shadow-level-3 py-2 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="text-label-lg font-bold text-on-surface">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-label-sm bg-primary-container text-on-primary-container rounded-chip font-semibold">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-label-sm text-primary hover:underline"
                >
                  Đã đọc tất cả
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px] text-outline mb-1">notifications_off</span>
                  <p className="text-body-sm">Bạn chưa có thông báo nào</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-surface-container-low flex items-start gap-3 ${
                      !n.readAt ? 'bg-primary-container/15' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
                      {n.type === 'order' ? 'receipt_long' : n.type === 'brand_approval' ? 'verified' : 'info'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-body-sm text-on-surface line-clamp-1 ${!n.readAt ? 'font-semibold' : ''}`}>
                        {n.title}
                      </p>
                      <p className="text-body-xs text-on-surface-variant line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Avatar User Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => { setMenuOpen(o => !o); setNotifOpen(false); }}
          className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Tài khoản người dùng"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-surface-container-lowest border border-outline-variant rounded-card shadow-level-2 py-1 z-50">
            <div className="px-4 py-2 border-b border-outline-variant/50">
              <p className="text-label-md font-semibold text-on-surface truncate">{user.displayName || 'Người dùng Ví Xanh'}</p>
              <p className="text-label-sm text-on-surface-variant truncate">{user.email}</p>
            </div>
            {menuItems.map(item => (
              <button
                key={item.label}
                onClick={() => { item.onClick(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="border-t border-outline-variant/30 my-1" />
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-body-md text-red-600 hover:bg-surface-container-low transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
