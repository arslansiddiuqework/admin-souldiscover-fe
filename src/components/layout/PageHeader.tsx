import React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  /** Optional metric chips shown under the description */
  meta?: React.ReactNode;
};

/** Premium page title block — matches the modern dashboard language. */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <section className="page-hero mb-5">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="label-eyebrow text-primary mb-1.5">{eyebrow}</p> : null}
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-[1.75rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
