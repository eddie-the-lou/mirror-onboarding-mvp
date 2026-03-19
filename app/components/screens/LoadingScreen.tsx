import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function LoadingScreen({
  error,
  onRetry,
  startedAtMs,
}: {
  error: string | null;
  onRetry: (() => void) | null;
  startedAtMs: number;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const elapsedSec = Math.max(0, Math.floor((now - startedAtMs) / 1000));
  const hint = useMemo(() => {
    if (elapsedSec < 4) return 'Reading your answers…';
    if (elapsedSec < 8) return 'Generating your report…';
    if (elapsedSec < 12) return 'Tightening the language…';
    return 'Still working…';
  }, [elapsedSec]);

  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        Give me a moment. I&apos;m putting something together for you.
      </p>
      <p className="mt-3 text-xs text-[color:var(--mirror-muted)]">
        {hint} ({elapsedSec}s)
      </p>
      <div className="mt-6 h-10 w-full rounded-full bg-[radial-gradient(circle_at_0%_0%,rgba(215,179,107,0.18),transparent_55%)] animate-pulse" />
      {error ? (
        <div className="mt-6 space-y-4">
          <p className="text-xs leading-relaxed text-[color:var(--mirror-muted)]">{error}</p>
          {onRetry ? (
            <div className="flex justify-end">
              <Button onClick={onRetry}>Retry</Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

