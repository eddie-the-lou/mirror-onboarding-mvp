import { useEffect } from 'react';

export function AutoAdvance({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    onNext();
  }, [onNext]);

  return null;
}

