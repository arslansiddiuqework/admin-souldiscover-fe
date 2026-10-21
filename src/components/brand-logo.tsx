import Image from "next/image";
import {
  BRAND_CAPTION,
  BRAND_ICON_SRC,
  BRAND_LOGO_SRC,
  BRAND_NAME,
} from "@/lib/branding";

type AdminBrandLogoProps = {
  variant?: "icon" | "mark" | "stacked" | "full";
  size?: number;
  className?: string;
  showCaption?: boolean;
  priority?: boolean;
};

/**
 * Official Soul Discovery logo — mirrors the user-facing BrandLogo treatment.
 * - icon: circular mark only
 * - mark: icon + name (sidebar / compact)
 * - stacked: icon + name + caption (auth)
 * - full: full lockup artwork
 */
export function AdminBrandLogo({
  variant = "mark",
  size = 32,
  className = "",
  showCaption = false,
  priority = false,
}: AdminBrandLogoProps) {
  if (variant === "full") {
    return (
      <Image
        src={BRAND_LOGO_SRC}
        alt={`${BRAND_NAME} — ${BRAND_CAPTION}`}
        width={1024}
        height={1024}
        priority={priority}
        className={`h-auto w-full object-contain ${className}`}
      />
    );
  }

  const icon = (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF6FA] ring-1 ring-[#EADCE5]/70"
      style={{ width: size, height: size }}
      aria-hidden={variant !== "icon"}
    >
      <Image
        src={BRAND_ICON_SRC}
        alt={variant === "icon" ? BRAND_NAME : ""}
        width={size}
        height={size}
        priority={priority}
        className="object-cover"
        style={{ width: size, height: size }}
      />
    </span>
  );

  if (variant === "icon") {
    return <span className={`inline-flex ${className}`}>{icon}</span>;
  }

  const captionVisible = variant === "stacked" || showCaption;

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${
        variant === "stacked" ? "flex-col gap-2 text-center" : ""
      } ${className}`}
    >
      {icon}
      <span
        className={`flex min-w-0 flex-col ${
          variant === "stacked" ? "items-center" : "items-start leading-tight"
        }`}
      >
        <span
          className={`font-bold tracking-[-0.02em] text-[#49263D] ${
            variant === "stacked" ? "text-[1.45rem]" : "text-[15px]"
          }`}
        >
          {BRAND_NAME}
        </span>
        {captionVisible ? (
          <span
            className={`mt-0.5 max-w-[28ch] text-[11px] font-medium leading-snug tracking-[0.01em] text-[#795A70] ${
              variant === "stacked" ? "mt-1 text-[12px]" : ""
            }`}
          >
            {BRAND_CAPTION}
          </span>
        ) : (
          <span className="truncate text-[10px] font-medium text-[#927C8B]">
            Admin Console
          </span>
        )}
      </span>
    </span>
  );
}
