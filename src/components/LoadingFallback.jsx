// P0-3: Fallback loading component cho React.lazy / Suspense
// Dùng design token đúng theme, có animation nhẹ nhàng
export default function LoadingFallback() {
  return (
    <div className="max-w-content mx-auto w-full px-margin-mobile md:px-margin-tablet py-space-4xl flex flex-col items-center justify-center gap-space-lg">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-surface-container-high" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-body-md text-on-surface-variant animate-pulse">Đang tải...</p>
    </div>
  );
}
