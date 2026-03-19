import { useEffect } from 'react';
import { Card } from '../ui/Card';

type Props = {
  onNext: () => void;
};

export function DemographicsIntro({ onNext }: Props) {
  useEffect(() => {
    const timer = setTimeout(onNext, 1000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        First, some quick basics.
      </p>
      <button
        type="button"
        className="mt-6 text-xs text-[color:var(--mirror-muted)] underline underline-offset-4"
        onClick={onNext}
      >
        Tap to continue
      </button>
    </Card>
  );
}

