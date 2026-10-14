import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './DotGrid.css';

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 16,
  gap = 32,
  baseColor = '#5227FF',
  activeColor = '#5227FF',
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = '',
  style
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0
  });
  // Highlight state: target in client coords, eased position in canvas coords,
  // and an intensity that fades in/out so the glow never jumps or sticks.
  const glowRef = useRef({ clientX: -9999, clientY: -9999, x: -9999, y: -9999, intensity: 0, active: false });
  const visibleRef = useRef(true);

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;
    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;
    const extraX = width - gridW;
    const extraY = height - gridH;
    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({ cx: startX + x * cell, cy: startY + y * cell, xOffset: 0, yOffset: 0, _inertiaApplied: false });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    if (!circlePath) return;
    let rafId: number;
    const proxSq = proximity * proximity;
    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas || !visibleRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ease the glow toward the pointer every frame (pointer events are sparse).
      const glow = glowRef.current;
      const rect = canvas.getBoundingClientRect();
      const tx = glow.clientX - rect.left;
      const ty = glow.clientY - rect.top;
      if (glow.intensity < 0.01) { glow.x = tx; glow.y = ty; }
      else { glow.x += (tx - glow.x) * 0.2; glow.y += (ty - glow.y) * 0.2; }
      glow.intensity += ((glow.active ? 1 : 0) - glow.intensity) * 0.12;
      
      // Clear with identity transform to ensure full canvas is cleared regardless of scale (DPR)
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      const px = glow.x;
      const py = glow.y;
      const strength = glow.intensity;
      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;
        let style = baseColor;
        if (strength > 0.01 && dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = (1 - dist / proximity) * strength;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          style = `rgb(${r},${g},${b})`;
        }
        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = style;
        ctx.fill(circlePath);
        ctx.restore();
      }
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [proximity, baseColor, activeRgb, baseRgb, circlePath]);

  useEffect(() => {
    buildGrid();
    
    const handleResize = () => buildGrid();
    
    let ro: ResizeObserver | null = null;
    ro = new ResizeObserver(handleResize);
    wrapperRef.current && ro.observe(wrapperRef.current);

    // Skip drawing while the grid is scrolled out of view.
    const io = new IntersectionObserver(([entry]) => { visibleRef.current = !!entry?.isIntersecting; });
    wrapperRef.current && io.observe(wrapperRef.current);

    // Handle zoom by listening for DPR changes
    let mq: MediaQueryList | null = null;
    const listenDPR = () => {
      if (mq) mq.removeEventListener('change', listenDPR);
      buildGrid();
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mq.addEventListener('change', listenDPR);
    };
    listenDPR();

    return () => {
      if (ro) ro.disconnect();
      io.disconnect();
      (window as Window).removeEventListener('resize', handleResize);
      if (mq) mq.removeEventListener('change', listenDPR);
    };
  }, [buildGrid]);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = clientX - pr.lastX;
      const dy = clientY - pr.lastY;
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale; vy *= scale; speed = maxSpeed;
      }
      pr.lastTime = now; pr.lastX = clientX; pr.lastY = clientY;
      pr.vx = vx; pr.vy = vy; pr.speed = speed;
      const rect = canvas.getBoundingClientRect();
      pr.x = clientX - rect.left;
      pr.y = clientY - rect.top;

      // Skip if pointer is outside the canvas (keeps page scroll-friendly)
      if (pr.x < 0 || pr.y < 0 || pr.x > rect.width || pr.y > rect.height) return;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed >= speedTrigger && dist < proximity && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const pushX = (dot.cx - pr.x) * 0.3 + vx * 0.003;
          const pushY = (dot.cy - pr.y) * 0.3 + vy * 0.003;
          gsap.to(dot, {
            xOffset: pushX, yOffset: pushY, duration: 0.3, ease: 'power2.out',
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.75)',
                onComplete: () => { dot._inertiaApplied = false; }
              });
            }
          });
        }
      }
    };

    const handleShock = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return;
      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - cx) * shockStrength * falloff * 0.1;
          const pushY = (dot.cy - cy) * shockStrength * falloff * 0.1;
          gsap.to(dot, {
            xOffset: pushX, yOffset: pushY, duration: 0.4, ease: 'power3.out',
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.75)',
                onComplete: () => { dot._inertiaApplied = false; }
              });
            }
          });
        }
      }
    };

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Touch screens have no hover: a glow would stick where the finger was and
    // every scroll would shove the dots. On touch, only a tap sends a ripple.
    const isTouch = window.matchMedia?.('(hover: none)').matches;

    const onMouseMove = (e: MouseEvent) => {
      const glow = glowRef.current;
      glow.clientX = e.clientX;
      glow.clientY = e.clientY;
      glow.active = true;
    };
    const onMouseLeave = () => { glowRef.current.active = false; };
    const onPush = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onClick = (e: MouseEvent) => handleShock(e.clientX, e.clientY);

    let touchStart: { x: number; y: number; t: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart = t && e.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: performance.now() } : null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!touchStart || !t) return;
      const moved = Math.hypot(t.clientX - touchStart.x, t.clientY - touchStart.y);
      if (moved < 10 && performance.now() - touchStart.t < 400) handleShock(t.clientX, t.clientY);
      touchStart = null;
    };

    if (reduceMotion) return;
    const throttledPush = throttle(onPush, 50);
    if (isTouch) {
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
    } else {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('mousemove', throttledPush, { passive: true });
      document.documentElement.addEventListener('mouseleave', onMouseLeave);
      window.addEventListener('click', onClick);
    }
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousemove', throttledPush);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
    };
  }, [maxSpeed, speedTrigger, proximity, resistance, returnDuration, shockRadius, shockStrength]);

  return (
    <section className={`dot-grid ${className}`} style={style}>
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </section>
  );
};

export default DotGrid;
