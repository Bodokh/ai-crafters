'use client';

import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import './LogoSlider.css';

// Animation configuration constants
const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2
};

// Logo item type
interface LogoItem {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lightLogo?: boolean; // For logos that are already light/white colored
}

// Props type for LogoLoop component
interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right';
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
}

// Custom hook for resize observer
const useResizeObserver = (
  callback: () => void,
  elements: React.RefObject<HTMLElement | null>[],
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener('resize', handleResize);
      callback();
      return () => window.removeEventListener('resize', handleResize);
    }

    const observers = elements.map(ref => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

// Custom hook for image loading
const useImageLoader = (
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];

    if (images.length === 0) {
      onLoad();
      return;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) {
        onLoad();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad, { once: true });
        img.addEventListener('error', handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

// Custom hook for animation loop
const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  isHovered: boolean,
  pauseOnHover: boolean
) => {
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (seqWidth > 0) {
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;

        const translateX = -offsetRef.current;
        track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover, trackRef]);
};

// LogoLoop component
const LogoLoop = memo(({
  logos,
  speed = 80,
  direction = 'left',
  logoHeight = 48,
  gap = 48,
  pauseOnHover = true,
  fadeOut = true,
  scaleOnHover = true,
  ariaLabel = 'Client logos',
  className
}: LogoLoopProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const directionMultiplier = direction === 'left' ? 1 : -1;
    const speedMultiplier = speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [speed, direction]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceWidth = seqRef.current?.getBoundingClientRect?.()?.width ?? 0;

    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight]);
  useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight]);
  useAnimationLoop(trackRef, targetVelocity, seqWidth, isHovered, pauseOnHover);

  const cssVariables = useMemo(
    () => ({
      '--logo-slider-gap': `${gap}px`,
      '--logo-slider-logo-height': `${logoHeight}px`
    } as React.CSSProperties),
    [gap, logoHeight]
  );

  const rootClassName = useMemo(
    () =>
      ['logo-slider', fadeOut && 'logo-slider--fade', scaleOnHover && 'logo-slider--scale-hover', className]
        .filter(Boolean)
        .join(' '),
    [fadeOut, scaleOnHover, className]
  );

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsHovered(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsHovered(false);
  }, [pauseOnHover]);

  const renderLogoItem = useCallback((item: LogoItem, key: string) => {
    return (
      <li className="logo-slider__item" key={key} role="listitem">
        <img
          src={item.src}
          width={item.width}
          height={item.height}
          alt={item.alt ?? ''}
          loading="lazy"
          decoding="async"
          draggable={false}
          data-light-logo={item.lightLogo ? 'true' : undefined}
        />
      </li>
    );
  }, []);

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className="logo-slider__list"
          key={`copy-${copyIndex}`}
          role="list"
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
        </ul>
      )),
    [copyCount, logos, renderLogoItem]
  );

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      style={cssVariables}
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="logo-slider__track" ref={trackRef}>
        {logoLists}
      </div>
    </div>
  );
});

LogoLoop.displayName = 'LogoLoop';

// Client logos configuration
const clientLogos: LogoItem[] = [
  { src: '/images/clients/chutzlaaretz.svg?v=2', alt: 'Chutzlaaretz', lightLogo: true },
  { src: '/images/clients/getmedia.png', alt: 'GetMedia' },
  { src: '/images/clients/target-board.png', alt: 'Target Board' },
  { src: '/images/clients/everywatch.svg', alt: 'Everywatch' },
  { src: '/images/clients/elbit-systems.png', alt: 'Elbit Systems' },
  { src: '/images/clients/worklik-logo.svg', alt: 'Worklik' },
  { src: '/images/clients/colors-ai.png', alt: 'Colors AI' },
  { src: '/images/clients/bgu.png', alt: 'Ben Gurion University' },
  { src: '/images/clients/rashut-sdot-teufa.svg', alt: 'Israel Airports Authority' },
  { src: '/images/clients/kueez.svg', alt: 'Kueez' },
  { src: '/images/clients/skyit.png', alt: 'Skyit Group' }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100
    }
  }
};

// Main LogoSlider component
export const LogoSlider = () => {
  const t = useTranslations('clients');

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="py-16 md:py-24 bg-background"
    >
      <div className="container mx-auto px-6 text-center">
        <motion.p
          variants={itemVariants}
          className="text-sm uppercase tracking-widest text-muted-foreground font-mono mb-12"
        >
          {t('subtitle')}
        </motion.p>
        <motion.div variants={itemVariants} className="dir-ltr">
          <LogoLoop
            logos={clientLogos}
            speed={120}
            direction="left"
            logoHeight={36}
            gap={64}
            pauseOnHover={true}
            scaleOnHover={true}
            fadeOut={true}
            ariaLabel="Our clients"
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default LogoSlider;

