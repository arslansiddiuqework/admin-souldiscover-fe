"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  tint: 0 | 1 | 2;
  glow: boolean;
  phase: number;
};

type Palette = {
  fill: string;
  line: string;
};

/* Blush orchid particle tints — match user web */
const PALETTES: Palette[] = [
  { fill: "155,55,110", line: "183,71,131" },
  { fill: "120,45,90", line: "159,55,111" },
  { fill: "130,70,155", line: "150,88,183" },
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
}

function particleCountFor(width: number, height: number): number {
  const area = width * height;
  if (width < 640) {
    return Math.max(20, Math.min(40, Math.round(area / 22000)));
  }
  if (width < 1024) {
    return Math.max(35, Math.min(60, Math.round(area / 18000)));
  }
  return Math.max(50, Math.min(90, Math.round(area / 16000)));
}

function connectionDistanceFor(width: number): number {
  if (width < 640) return 85;
  if (width < 1024) return 110;
  return 130;
}

function createParticles(width: number, height: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const speed = 0.08 + Math.random() * 0.14;
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: width < 640 ? 0.8 + Math.random() * 0.6 : 1 + Math.random() * 1.1,
      baseAlpha: 0.08 + Math.random() * 0.1,
      tint: (Math.random() < 0.55 ? 0 : Math.random() < 0.65 ? 1 : 2) as 0 | 1 | 2,
      glow: Math.random() < 0.12,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

/**
 * Calm connected-dot atmosphere (Spatium-style).
 * Canvas + rAF only — no per-frame React state.
 */
export function ConnectedParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let connectDist = 130;
    let reduced = prefersReducedMotion();
    const touchDevice = isCoarsePointer();
    let running = true;

    const mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      connectDist = connectionDistanceFor(width);
      const count = particleCountFor(width, height);
      particles = createParticles(width, height, count);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const palette = PALETTES[p.tint];
        ctx.beginPath();
        ctx.fillStyle = `rgba(${palette.fill},${p.baseAlpha * 0.85})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      const maxDistSq = connectDist * connectDist;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxDistSq) continue;
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / connectDist;
          const alpha = t * t * 0.12;
          if (alpha < 0.01) continue;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(150,130,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    };

    const tick = (time: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      const maxDist = connectDist;
      const maxDistSq = maxDist * maxDist;
      const mouseRadius = 140;
      const mouseRadiusSq = mouseRadius * mouseRadius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Soft drift / orbital wobble
        p.phase += 0.0025;
        p.x += p.vx + Math.cos(p.phase) * 0.04;
        p.y += p.vy + Math.sin(p.phase * 0.9) * 0.04;

        // Extremely subtle mouse repulsion (desktop only)
        if (mouse.active && !touchDevice) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDistSq = mdx * mdx + mdy * mdy;
          if (mDistSq < mouseRadiusSq && mDistSq > 0.01) {
            const mDist = Math.sqrt(mDistSq);
            const force = ((mouseRadius - mDist) / mouseRadius) * 0.035;
            p.x += (mdx / mDist) * force;
            p.y += (mdy / mDist) * force;
          }
        }

        // Soft wrap
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;

        const pulse = 0.85 + Math.sin(time * 0.0012 + p.phase) * 0.15;
        const alpha = p.baseAlpha * pulse;
        const palette = PALETTES[p.tint];

        if (p.glow) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${palette.fill},${alpha * 0.18})`;
          ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${palette.fill},${alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connections — nearby only
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxDistSq) continue;

          const dist = Math.sqrt(distSq);
          let t = 1 - dist / maxDist;
          t = t * t;

          let alpha = t * 0.14;

          // Slightly brighten links near cursor
          if (mouse.active && !touchDevice) {
            const mx = (a.x + b.x) * 0.5 - mouse.x;
            const my = (a.y + b.y) * 0.5 - mouse.y;
            const near = mx * mx + my * my < mouseRadiusSq;
            if (near) alpha = Math.min(0.22, alpha * 1.45);
          }

          if (alpha < 0.012) continue;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(150,130,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    const onResize = () => {
      resize();
      if (reduced) drawStatic();
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      window.cancelAnimationFrame(raf);
      resize();
      if (reduced) {
        drawStatic();
      } else {
        raf = window.requestAnimationFrame(tick);
      }
    };

    resize();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", onMotionChange);
    window.addEventListener("resize", onResize, { passive: true });

    if (!touchDevice) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mouseleave", onMouseLeave);
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
    }

    if (reduced) {
      drawStatic();
    } else {
      raf = window.requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-70"
    />
  );
}
