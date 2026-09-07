import { useEffect, useRef, useState } from 'react';

export default function CountUp({
  end,
  start = 0,
  duration = 800,
  suffix = '',
  prefix = '',
  separator = '.',
  decimals = 0,
  className = '',
  trigger = true,
}) {
  const [value, setValue] = useState(start);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!trigger || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [trigger, end]);

  function animate() {
    const startTime = performance.now();
    const diff = end - start;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function formatNumber(num) {
    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart ? `${formatted},${decPart}` : formatted;
  }

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(value)}{suffix}
    </span>
  );
}
