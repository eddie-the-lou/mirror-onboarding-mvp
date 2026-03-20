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
      <p className="mirror-body-sm">
        First, some quick basics.
      </p>
      <button
        type="button"
        className="mt-6 text-sm font-medium text-[color:var(--mirror-fg-muted)] underline underline-offset-4 hover:text-[color:var(--mirror-accent)] transition-colors"
        onClick={onNext}
      >
        Tap to continue
      </button>
    </Card>
  );
}

