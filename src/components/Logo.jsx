export default function Logo({ size = 'default', showText = true, className = '' }) {
  const sizes = {
    small: { circle: 28, diamond: 14, dot: 2.5, text: 'text-title-md' },
    default: { circle: 32, diamond: 16, dot: 3, text: 'text-title-lg' },
    large: { circle: 48, diamond: 24, dot: 4, text: 'text-headline-md' },
  };
  const s = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-space-sm ${className}`}>
      <svg width={s.circle} height={s.circle} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="#DCEEDF" />
        <g transform="translate(24,24) rotate(45)">
          <rect x="-11" y="-11" width="22" height="22" rx="3" fill="none" stroke="#1C3B2E" strokeWidth="2.5" />
        </g>
        <circle cx="24" cy="24" r={s.dot} fill="#1C3B2E" />
      </svg>
      {showText && (
        <span className={`font-extrabold text-primary tracking-tight ${s.text}`}>
          Ví Xanh
        </span>
      )}
    </div>
  );
}
