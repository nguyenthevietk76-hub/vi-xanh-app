import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-space-xl">
          <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-card p-space-2xl text-center shadow-level-2">
            <div className="w-16 h-16 mx-auto mb-space-lg rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-title-lg">warning</span>
            </div>
            <h2 className="text-title-lg font-bold text-on-surface mb-space-xs">
              Đã có sự cố xảy ra
            </h2>
            <p className="text-body-md text-on-surface-variant mb-space-xl">
              Hệ thống gặp lỗi tạm thời khi hiển thị trang này. Bạn có thể thử tải lại hoặc quay về trang chủ.
            </p>
            <div className="flex flex-col sm:flex-row gap-space-sm justify-center">
              <button
                onClick={this.handleReload}
                className="px-space-lg py-space-sm bg-primary text-on-primary rounded-chip font-semibold text-label-md hover:bg-primary/90 transition-colors"
              >
                Tải lại trang
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-space-lg py-space-sm bg-surface-container-low text-on-surface border border-outline-variant rounded-chip font-semibold text-label-md hover:bg-surface-container-high transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
