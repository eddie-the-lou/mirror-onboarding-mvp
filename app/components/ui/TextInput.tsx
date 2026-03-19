import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

export const TextInput = forwardRef<HTMLInputElement, Props>(function TextInput(
  { className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-xl border border-[color-mix(in_oklab,var(--mirror-muted)_60%,transparent)] bg-[color:var(--mirror-bg)] px-4 py-3 text-sm text-[color:var(--mirror-fg)] placeholder:text-[color:var(--mirror-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mirror-accent)] ${className}`}
      {...rest}
    />
  );
});

