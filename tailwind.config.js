/** @type {import('tailwindcss').Config} */

// Màu theme lấy từ biến CSS. Bọc bằng color-mix để các class có độ mờ (vd bg-primary/60,
// bg-surface-container-lowest/95) được Tailwind sinh ra — nếu chỉ ghi 'var(--x)' thì các class này bị bỏ qua.
const themeVar = (name) => `color-mix(in srgb, var(${name}) calc(<alpha-value> * 100%), transparent)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Surface & Background ── */
        surface: themeVar('--color-surface'),
        'surface-dim': themeVar('--color-surface-dim'),
        'surface-bright': themeVar('--color-surface-bright'),
        'surface-container-lowest': themeVar('--color-surface-container-lowest'),
        'surface-container-low': themeVar('--color-surface-container-low'),
        'surface-container': themeVar('--color-surface-container'),
        'surface-container-high': themeVar('--color-surface-container-high'),
        'surface-container-highest': themeVar('--color-surface-container-highest'),
        'on-surface': themeVar('--color-on-surface'),
        'on-surface-variant': themeVar('--color-on-surface-variant'),
        'inverse-surface': themeVar('--color-inverse-surface'),
        'inverse-on-surface': themeVar('--color-inverse-on-surface'),
        outline: themeVar('--color-outline'),
        'outline-variant': themeVar('--color-outline-variant'),
        'surface-tint': themeVar('--color-surface-tint'),
        background: themeVar('--color-background'),
        'on-background': themeVar('--color-on-background'),

        /* ── Brand ── */
        primary: themeVar('--color-primary'),
        'on-primary': themeVar('--color-on-primary'),
        'primary-container': themeVar('--color-primary-container'),
        'on-primary-container': themeVar('--color-on-primary-container'),
        'inverse-primary': themeVar('--color-inverse-primary'),
        secondary: themeVar('--color-secondary'),
        'on-secondary': themeVar('--color-on-secondary'),
        'secondary-container': themeVar('--color-secondary-container'),
        'on-secondary-container': themeVar('--color-on-secondary-container'),
        'secondary-fixed': themeVar('--color-secondary-fixed'),
        'secondary-fixed-dim': themeVar('--color-secondary-fixed-dim'),
        'on-secondary-fixed': themeVar('--color-on-secondary-fixed'),
        'on-secondary-fixed-variant': themeVar('--color-on-secondary-fixed-variant'),
        tertiary: themeVar('--color-tertiary'),
        'on-tertiary': themeVar('--color-on-tertiary'),
        'tertiary-container': themeVar('--color-tertiary-container'),
        'on-tertiary-container': themeVar('--color-on-tertiary-container'),
        'tertiary-fixed': themeVar('--color-tertiary-fixed'),
        'primary-fixed': themeVar('--color-primary-fixed'),
        'primary-fixed-dim': themeVar('--color-primary-fixed-dim'),

        /* ── Status & Accent ── */
        error: themeVar('--color-error'),
        'on-error': themeVar('--color-on-error'),
        'error-container': themeVar('--color-error-container'),
        'on-error-container': themeVar('--color-on-error-container'),
        'sky-tint': themeVar('--color-sky-tint'),
        'sunlit-ochre': themeVar('--color-sunlit-ochre'),
        'sunlit-ochre-text': themeVar('--color-sunlit-ochre-text'),
        'coral-mist': themeVar('--color-coral-mist'),
        'coral-mist-text': themeVar('--color-coral-mist-text'),

        /* ── Xanh nhạt / xanh lá — mã hex trực tiếp để dùng được độ mờ (vd bg-eco-tint/60) ── */
        'eco-tint': '#DCEEDF',
        'leaf-green': '#2e694b',
      },

      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        'display-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg-mobile': ['26px', { lineHeight: '34px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'title-md': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '500' }],
      },

      spacing: {
        'space-2xs': '0.25rem',
        'space-xs': '0.5rem',
        'space-sm': '0.75rem',
        'space-md': '1rem',
        'space-lg': '1.25rem',
        'space-xl': '1.5rem',
        'space-2xl': '2rem',
        'space-3xl': '2.5rem',
        'space-4xl': '3rem',
        'gutter-mobile': '1rem',
        'gutter-desktop': '1.5rem',
        'margin-mobile': '1rem',
        'margin-tablet': '2rem',
        'margin-desktop': '2.5rem',
      },

      borderRadius: {
        card: '16px',
        hero: '20px',
        input: '14px',
        chip: '9999px',
        nested: '12px',
        'nested-sm': '10px',
      },

      boxShadow: {
        'level-2': '0 4px 20px -2px rgba(28,59,46,0.05), 0 2px 6px -1px rgba(28,59,46,0.03)',
        'level-2-hover': '0 8px 28px -4px rgba(28,59,46,0.08), 0 4px 10px -2px rgba(28,59,46,0.05)',
        'level-3': '0 16px 36px -4px rgba(28,59,46,0.12)',
        'focus-ring': '0 0 0 3px rgba(220,238,223,0.6)',
        subtle: '0 1px 4px rgba(28,59,46,0.04)',
      },

      maxWidth: {
        content: '1200px',
      },

      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        decelerate: 'cubic-bezier(0.0, 0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
        spring: 'cubic-bezier(0.33, 1, 0.68, 1)',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.33,1,0.68,1) both',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
