import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost';
  }
>;

export function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mirror-bg)]';

  const variants: Record<typeof variant, string> = {
    primary:
      'bg-[color:var(--mirror-accent)] text-[color:var(--mirror-bg)] hover:bg-[color-mix(in_oklab,var(--mirror-accent)_80%,#ffffff)] disabled:opacity-40 disabled:hover:bg-[color:var(--mirror-accent)]',
    ghost:
      'border border-[color-mix(in_oklab,var(--mirror-muted)_60%,transparent)] text-[color:var(--mirror-fg)] hover:border-[color:var(--mirror-accent)] hover:text-[color:var(--mirror-accent)] disabled:opacity-40',
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

