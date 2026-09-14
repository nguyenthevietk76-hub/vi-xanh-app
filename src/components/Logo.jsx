export default function Logo({ size = 'default', showText = true, className = '' }) {
  const sizes = {
    small: { img: 28, text: 'text-title-md' },
    default: { img: 32, text: 'text-title-lg' },
    large: { img: 48, text: 'text-headline-md' },
  };
  const s = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-space-sm ${className}`}>
      <img
        src="/images/logo.png"
        alt="Ví Xanh Logo"
        width={s.img}
        height={s.img}
        className="object-contain"
      />
      {showText && (
        <span className={`font-extrabold text-primary tracking-tight ${s.text}`}>
          Ví Xanh
        </span>
      )}
    </div>
  );
}
