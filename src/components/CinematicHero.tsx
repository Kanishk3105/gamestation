import { lazy, Suspense, useRef } from 'react';
import { motion, type MotionValue, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useIsMobile, useIsTablet, usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { MagneticButton } from './MagneticButton';
import { interpolateFrames } from './hero/keyframes';

const HeroScene = lazy(() => import('./hero/HeroScene').then((mod) => ({ default: mod.HeroScene })));

interface CinematicHeroProps {
  onBrowseCatalog: () => void;
  onViewTrending: () => void;
}

export function CinematicHero({ onBrowseCatalog, onViewTrending }: CinematicHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const inView = useInView(sectionRef, { amount: 0.15 });
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.18, 0.72, 0.9], [1, 1, 0.15, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const glassSplit = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const cutVar = useMotionTemplate`${glassSplit}`;
  const shellX = useTransform(scrollYProgress, (p) => interpolateFrames(p).layers.shell.x * 48);
  const shellY = useTransform(scrollYProgress, (p) => interpolateFrames(p).layers.shell.y * -36);
  const shellScale = useTransform(scrollYProgress, (p) => interpolateFrames(p).layers.shell.scale);
  const controllerX = useTransform(scrollYProgress, (p) => interpolateFrames(p).layers.controller.x * 90);
  const artworkX = useTransform(scrollYProgress, (p) => interpolateFrames(p).layers.artwork.x * 80);

  scrollYProgress.on('change', (value) => {
    progressRef.current = value;
  });

  const useWebGL = !isMobile && !reduced;

  return (
    <section ref={sectionRef} className="gs-hero-scroll" aria-label="Cinematic product story">
      <div className="gs-hero-sticky">
        <div className="gs-hero-stage">
          {useWebGL ? (
            <Suspense fallback={<HeroFallback shellX={shellX} shellY={shellY} shellScale={shellScale} />}>
              <HeroScene progressRef={progressRef} reduced={reduced || isTablet} active={inView} />
            </Suspense>
          ) : (
            <HeroFallback shellX={shellX} shellY={shellY} shellScale={shellScale} />
          )}
        </div>

        <motion.div
          className="gs-hero-copy"
          style={{ opacity: copyOpacity, y: copyY }}
        >
          <p className="gs-kicker">PlayStation rentals, studio-grade</p>
          <h1>
            Borrow the console.
            <span> Keep the campaign.</span>
          </h1>
          <p className="gs-lede">
            GameStation delivers calibrated PS5 packages across India — timed, insured, and collected when the story ends.
          </p>
          <div className="gs-hero-actions">
            <MagneticButton className="gs-btn gs-btn-primary" onClick={onBrowseCatalog}>
              Browse catalog
            </MagneticButton>
            <MagneticButton className="gs-btn gs-btn-ghost" onClick={onViewTrending}>
              Trending kits
            </MagneticButton>
          </div>
          <dl className="gs-hero-stats">
            <div><dt>23 kits</dt><dd>Authoritative catalogue</dd></div>
            <div><dt>From ₹158</dt><dd>Per day, backend-priced</dd></div>
            <div><dt>Pickup included</dt><dd>Scheduled return window</dd></div>
          </dl>
        </motion.div>

        <motion.div className="gs-glass-cut" style={{ ['--cut' as string]: cutVar } as never} aria-hidden="true">
          <span />
          <span />
          <span />
        </motion.div>

        {!useWebGL && (
          <div className="gs-hero-stage" aria-hidden="true" style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.45 }}>
            <motion.div style={{ x: controllerX, position: 'absolute', right: '8%', bottom: '18%', width: 160 }}>
              <img src="https://images.sharepal.in/categories/gaming-consoles/ps5/ps5-with-2%20controllers/ps5-console-with-2-controllers-on-rent-sharepal-1.webp" alt="" />
            </motion.div>
            <motion.div style={{ x: artworkX, position: 'absolute', left: '6%', top: '22%', width: 140 }}>
              <img src="https://images.sharepal.in/categories/gaming-consoles/ps5/ps5-with-god-of-war-ragnarok/ps5-with-god-of-war-ragnarok-with-100-games-with-1-controller-on-rent-sharepal-1.webp" alt="" />
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

function HeroFallback({
  shellX,
  shellY,
  shellScale,
}: {
  shellX: MotionValue<number>;
  shellY: MotionValue<number>;
  shellScale: MotionValue<number>;
}) {
  return (
    <div className="gs-hero-fallback">
      <motion.img
        src="https://images.sharepal.in/categories/gaming-consoles/ps5/ps5-with-100-games-with-1-controller/ps5-with-100-games-with-1-controller-on-rent-sharepal-1.webp"
        alt="PlayStation 5 rental kit"
        style={{ x: shellX, y: shellY, scale: shellScale }}
      />
    </div>
  );
}
