import React from "react";

export type HeroTone = "violet" | "sky" | "peach" | "mint" | "orchid" | "plum";

type ScreenHeroProps = {
  tone?: HeroTone;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  /** Decorative right-side illustration / script */
  aside?: React.ReactNode;
  className?: string;
};

const toneClass: Record<HeroTone, string> = {
  violet: "page-hero page-hero--violet",
  sky: "page-hero page-hero--sky",
  peach: "page-hero page-hero--peach",
  mint: "page-hero page-hero--mint",
  orchid: "page-hero page-hero--orchid",
  plum: "page-hero page-hero--plum",
};

const iconWell: Record<HeroTone, string> = {
  violet: "bg-[#F0EAFE] text-[#7863C6]",
  sky: "bg-[#EEF4FF] text-[#4F7FE8]",
  peach: "bg-[#FFF1E9] text-[#C46B4A]",
  mint: "bg-[#EAF7EF] text-[#287D58]",
  orchid: "bg-[#FFE5F0] text-[#B74783]",
  plum: "bg-white/15 text-white",
};

/**
 * Full-spectrum screen hero — pick a tone so pages don't all look pink.
 * Sidebar stays untouched; this only styles the main canvas.
 */
export function ScreenHero({
  tone = "violet",
  eyebrow,
  title,
  description,
  meta,
  actions,
  aside,
  className = "",
}: ScreenHeroProps) {
  return (
    <section className={`${toneClass[tone]} mb-1 ${className}`}>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p
            className={`label-eyebrow mb-2 ${
              tone === "plum" ? "text-[#F9DCEB]" : "text-inherit opacity-80"
            }`}
            style={
              tone !== "plum"
                ? {
                    color:
                      tone === "violet"
                        ? "#7863C6"
                        : tone === "sky"
                          ? "#4F7FE8"
                          : tone === "peach"
                            ? "#C46B4A"
                            : tone === "mint"
                              ? "#287D58"
                              : "#B74783",
                  }
                : undefined
            }
          >
            {eyebrow}
          </p>
          <h1
            className={`text-3xl font-bold tracking-tight sm:text-[2rem] ${
              tone === "plum" ? "text-white" : "text-[#49263D]"
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`mt-2 max-w-xl text-sm leading-relaxed ${
                tone === "plum" ? "text-[#F3D5E6]/90" : "text-[#795A70]"
              }`}
            >
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div>
          ) : null}
          {actions ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>

        {aside !== undefined ? (
          aside
        ) : (
          <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center lg:mx-0 lg:h-32 lg:w-32">
            <div
              aria-hidden
              className={`absolute inset-0 rounded-[28px] opacity-60 blur-2xl ${iconWell[tone]}`}
            />
            <div
              className={`relative flex h-24 w-24 items-center justify-center rounded-[26px] shadow-lifted ring-1 ring-white/70 ${iconWell[tone]}`}
            >
              <span className="material-symbols-outlined text-[40px]">auto_awesome</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  icon,
  tone = "violet",
  spark,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: string;
  tone?: "violet" | "sky" | "peach" | "mint" | "orchid" | "alert";
  spark?: number[];
}) {
  const styles = {
    violet: {
      well: "bg-[#F0EAFE] text-[#7863C6]",
      glow: "#C4B5FD",
      spark: "#7863C6",
    },
    sky: {
      well: "bg-[#EEF4FF] text-[#4F7FE8]",
      glow: "#93C5FD",
      spark: "#4F7FE8",
    },
    peach: {
      well: "bg-[#FFF1E9] text-[#C46B4A]",
      glow: "#FDBA74",
      spark: "#C46B4A",
    },
    mint: {
      well: "bg-[#EAF7EF] text-[#287D58]",
      glow: "#86EFAC",
      spark: "#287D58",
    },
    orchid: {
      well: "bg-[#FFE5F0] text-[#B74783]",
      glow: "#F9A8D4",
      spark: "#B74783",
    },
    alert: {
      well: "bg-[#FFF0F2] text-[#B4233D]",
      glow: "#FDA4AF",
      spark: "#B4233D",
    },
  }[tone];

  const points = spark || [2, 3, 2.5, 4, 3.2, 5, 4.5, 6];
  const w = 64;
  const h = 26;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const d = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="metric-tile" style={{ ["--tile-glow" as string]: styles.glow }}>
      <div className="relative z-[1] flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles.well}`}
        >
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </span>
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-[#927C8B]">
          {label}
        </p>
      </div>
      <div className="relative z-[1] mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-[#49263D]">{value}</p>
          {hint ? <p className="mt-0.5 text-[11px] text-[#795A70]">{hint}</p> : null}
        </div>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
          <path
            d={d}
            fill="none"
            stroke={styles.spark}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
