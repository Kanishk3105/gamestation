import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';

type MagneticButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

export function MagneticButton({ children, className, disabled, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();
  const reduce = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  return (
    <motion.button
      ref={ref}
      className={className}
      disabled={disabled}
      style={{ x: sx, y: sy }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onMouseMove={(event) => {
        if (disabled || isMobile || reduce || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.18);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
