import Image from "next/image";
import {
  BRAND_CAPTION,
  BRAND_ICON_SRC,
  BRAND_NAME,
} from "@/lib/branding";

type AdminBrandLogoProps = {
  variant?: "icon" | "mark" | "stacked";
  size?: number;
  className?: string;
};

export function AdminBrandLogo({
  variant = "mark",
  size = 32,
  className = "",
}: AdminBrandLogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src={BRAND_ICON_SRC}
        alt={BRAND_NAME}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-2 text-center ${className}`}>
        <Image
          src={BRAND_ICON_SRC}
          alt=""
          width={size}
          height={size}
          className="object-contain"
          style={{ width: size, height: size }}
          aria-hidden
        />
        <span className="font-display text-xl font-semibold tracking-tight text-[#f3eefa]">
          {BRAND_NAME}
        </span>
        <span className="max-w-[28ch] text-[12px] font-medium leading-snug text-[rgba(231,218,237,0.55)]">
          {BRAND_CAPTION}
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={BRAND_ICON_SRC}
        alt=""
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
        aria-hidden
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-[15px] font-semibold tracking-tight text-[#f3eefa]">
          {BRAND_NAME}
        </span>
        <span className="truncate text-[10px] text-[rgba(231,218,237,0.55)]">
          Admin Console
        </span>
      </span>
    </span>
  );
}
