import type { ButtonHTMLAttributes } from 'react';

type Props = {
  selected?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function OptionButton({ selected, className = '', children, ...rest }: Props) {
  const base =
    'w-full text-left rounded-2xl border px-5 py-4 text-[0.9375rem] font-medium leading-snug transition-all duration-300 hover:border-[color:var(--mirror-accent)]';

  const selectedClasses =
    'border-[color:var(--mirror-accent)] bg-[var(--mirror-accent-dim)] text-[color:var(--mirror-fg)] shadow-[0_0_20px_rgba(228,179,99,0.15)]';

  const unselectedClasses =
    'border-[var(--mirror-glass-border)] bg-transparent text-[color:var(--mirror-fg)] hover:bg-[rgba(255,255,255,0.02)]';

  return (
    <button
      type="button"
      className={`${base} ${selected ? selectedClasses : unselectedClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
