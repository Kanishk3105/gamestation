import { useEffect } from 'react';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';

export function CursorSpotlight() {
  const isMobile = useIsMobile();
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (isMobile || reduce) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
        frame = 0;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile, reduce]);

  if (isMobile || reduce) return null;
  return <div className="gs-cursor-spotlight" aria-hidden="true" />;
}
