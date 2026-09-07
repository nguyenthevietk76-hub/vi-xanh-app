import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary text-on-primary hover:brightness-110',
  secondary: 'bg-secondary-container text-primary font-semibold hover:brightness-95',
  ghost: 'bg-transparent text-secondary hover:bg-surface-container-low hover:underline',
};

const sizes = {
  sm: 'h-10 px-space-lg text-body-sm',
  md: 'h-12 px-space-2xl text-label-lg',
  lg: 'h-[52px] px-space-3xl text-label-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  pill = false,
  icon,
  iconRight,
  loading = false,
  disabled = false,
  children,
  className = '',
  onClick,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={`
        inline-flex items-center justify-center gap-space-xs
        font-semibold transition-all duration-200 ease-standard
        focus-ring
        ${pill ? 'rounded-chip' : 'rounded-input'}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined icon-sm animate-spin">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined icon-sm">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined icon-sm">{iconRight}</span>
      )}
    </motion.button>
  );
}
