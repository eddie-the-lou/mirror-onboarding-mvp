import type { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}>;

export function Card({ title, description, className = '', children }: Props) {
  return (
    <section
      className={`rounded-3xl border border-[var(--mirror-glass-border)] bg-[var(--mirror-glass)] px-8 py-8 shadow-[var(--mirror-glow)] backdrop-blur-xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 50%, rgba(0,0,0,0.02) 100%)',
        boxShadow: 'var(--mirror-glow), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      {title ? (
        <h1 className="text-lg font-semibold leading-relaxed text-[color:var(--mirror-fg)] tracking-tight">
          {title}
        </h1>
      ) : null}
      {description ? (
        <p className="mt-3 mirror-body-sm">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}
