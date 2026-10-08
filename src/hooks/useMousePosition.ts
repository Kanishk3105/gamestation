import { useState, useEffect, useCallback, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useMousePosition(elementRef?: React.RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState<MousePosition>({
    x: 0, y: 0, normalizedX: 0, normalizedY: 0,
  });
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPosition({
          x, y,
          normalizedX: (x / rect.width) * 2 - 1,
          normalizedY: (y / rect.height) * 2 - 1,
        });
      } else {
        setPosition({
          x: e.clientX,
          y: e.clientY,
          normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
          normalizedY: (e.clientY / window.innerHeight) * 2 - 1,
        });
      }
    });
  }, [elementRef]);

  useEffect(() => {
    const target = elementRef?.current || window;
    target.addEventListener('mousemove', handleMouseMove as EventListener);
    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, elementRef]);

  return position;
}
