const chipVariants = {
  eco: 'bg-[#DCEEDF] text-primary',
  delivery: 'bg-sky-tint text-primary',
  milestone: 'bg-sunlit-ochre text-sunlit-ochre-text',
  reject: 'bg-coral-mist text-coral-mist-text',
  sale: 'bg-coral-mist text-coral-mist-text',
  hot: 'bg-sunlit-ochre text-sunlit-ochre-text',
  new: 'bg-secondary-container text-on-secondary-container',
  'points-only': 'bg-[#DCEEDF] text-primary',
  default: 'bg-surface-container-low text-on-surface-variant',
};

export default function Chip({ variant = 'default', children, icon, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3.5 py-1.5 rounded-chip
        text-label-md font-semibold whitespace-nowrap
        ${chipVariants[variant] || chipVariants.default}
        ${className}
      `}
    >
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  );
}
