import React from "react";
import { ScreenHero, type HeroTone } from "@/components/layout/ScreenHero";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  /** Visual tone — keep pages from looking identical pink */
  tone?: HeroTone;
  aside?: React.ReactNode;
};

/** Page title block — full-spectrum hero (defaults to violet, not pink). */
export function PageHeader({
  title,
  description,
  eyebrow = "Soul Discovery",
  actions,
  meta,
  tone = "violet",
  aside,
}: PageHeaderProps) {
  return (
    <ScreenHero
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      description={description}
      meta={meta}
      actions={actions}
      aside={aside}
    />
  );
}
