import React, { useRef, useEffect, useState } from 'react';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number; // stagger between chars (ms)
  duration?: number; // seconds per char
  ease?: string;
  splitType?: 'chars' | 'words';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
  style?: React.CSSProperties;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '0px',
  tag = 'p',
  textAlign,
  onLetterAnimationComplete,
  style,
}) => {
  const ref = useRef<HTMLElement>(null);
  const playedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if ((document as any).fonts?.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      (document as any).fonts?.ready?.then?.(() => setFontsLoaded(true)) ?? setFontsLoaded(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text || !fontsLoaded || playedRef.current) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onLetterAnimationComplete?.();
      playedRef.current = true;
      return;
    }

    const targets: HTMLElement[] = Array.from(
      el.querySelectorAll<HTMLElement>(splitType === 'words' ? '.split-word' : '.split-char')
    );
    if (!targets.length) return;

    // gsap is loaded on demand so it stays out of the main bundle.
    let observer: IntersectionObserver | undefined;
    let cancelled = false;
    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      gsap.set(targets, { ...from });

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting || playedRef.current) return;
          playedRef.current = true;
          observer?.disconnect();
          gsap.to(targets, {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            force3D: true,
            willChange: 'transform, opacity',
            onComplete: () => onLetterAnimationComplete?.(),
          });
        },
        { threshold, rootMargin }
      );
      observer.observe(el);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontsLoaded, splitType]);

  // Build split markup. Preserve spaces; wrap each unit so it can animate.
  const renderSplit = () => {
    if (splitType === 'words') {
      const parts = text.split(/(\s+)/);
      return parts.map((p, i) =>
        /^\s+$/.test(p) ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="split-word" style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
            {p}
          </span>
        )
      );
    }
    // chars: split into words to keep wrap behavior, then chars within
    const words = text.split(/(\s+)/);
    return words.map((w, i) => {
      if (/^\s+$/.test(w)) return <span key={i}> </span>;
      return (
        <span key={i} className="split-word" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {Array.from(w).map((ch, j) => (
            <span
              key={j}
              className="split-char"
              style={{ display: 'inline-block', willChange: 'transform, opacity' }}
            >
              {ch}
            </span>
          ))}
        </span>
      );
    });
  };

  const Tag = (tag || 'p') as React.ElementType;
  const mergedStyle: React.CSSProperties = {
    textAlign,
    overflow: 'hidden',
    wordWrap: 'break-word',
    ...style,
  };

  return (
    <Tag ref={ref as any} className={`split-parent ${className}`} style={mergedStyle}>
      {renderSplit()}
    </Tag>
  );
};

export default SplitText;
