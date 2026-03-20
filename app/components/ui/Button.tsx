import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost';
  }
>;

export function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mirror-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mirror-bg)]';

  const variants: Record<typeof variant, string> = {
    primary:
      'bg-[color:var(--mirror-accent)] text-[color:var(--mirror-bg)] hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(228,179,99,0.35)] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none',
    ghost:
      'border border-[var(--mirror-glass-border)] text-[color:var(--mirror-fg)] hover:border-[color:var(--mirror-accent)] hover:bg-[var(--mirror-accent-dim)] hover:text-[color:var(--mirror-accent)] active:scale-[0.98] disabled:opacity-40',
  };

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
