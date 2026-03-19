import type { ButtonHTMLAttributes } from 'react';

type Props = {
  selected?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function OptionButton({ selected, className = '', children, ...rest }: Props) {
  const base =
    'w-full text-left rounded-2xl border px-4 py-3 text-sm transition-colors hover:border-[color:var(--mirror-accent)] hover:bg-[color-mix(in_oklab,var(--mirror-bg)_80%,var(--mirror-accent))]';

  const selectedClasses =
    'border-[color:var(--mirror-accent)] bg-[color-mix(in_oklab,var(--mirror-bg)_70%,var(--mirror-accent))] text-[color:var(--mirror-fg)]';

  const unselectedClasses =
    'border-[color-mix(in_oklab,var(--mirror-muted)_60%,transparent)] text-[color:var(--mirror-fg)]';

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

