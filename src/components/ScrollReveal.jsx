import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

const presets = {
  'fade-up': {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0 },
  },
  'fade': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'scale': {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function ScrollReveal({
  children,
  preset = 'fade-up',
  delay = 0,
  duration = 0.4,
  stagger = 0,
  once = true,
  threshold = 0.2,
  className = '',
  as = 'div',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const variant = presets[preset] || presets['fade-up'];

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: variant.hidden,
        visible: {
          ...variant.visible,
          transition: {
            duration,
            delay,
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

// Child component for stagger animations
export function ScrollRevealItem({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
