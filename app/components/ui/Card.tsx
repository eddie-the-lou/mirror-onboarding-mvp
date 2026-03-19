import type { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}>;

export function Card({ title, description, className = '', children }: Props) {
  return (
    <section
      className={`rounded-3xl border border-[color-mix(in_oklab,var(--mirror-muted)_40%,transparent)] bg-[radial-gradient(circle_at_30%_0%,rgba(215,179,107,0.08),rgba(10,10,10,0.92)_45%,rgba(10,10,10,0.88)_100%)] px-8 py-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] ${className}`}
    >
      {title ? (
        <h1 className="text-lg font-medium leading-relaxed text-[color:var(--mirror-fg)]">
          {title}
        </h1>
      ) : null}
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--mirror-muted)]">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

