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
      <p className="mt-4 text-sm text-[color:var(--mirror-fg-muted)]">
        {hint} ({elapsedSec}s)
      </p>
      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[var(--mirror-glass-border)]">
        <div
          className="h-full rounded-full bg-[color:var(--mirror-accent)] transition-all duration-500 ease-out"
          style={{ width: `${Math.min(90, 15 + elapsedSec * 8)}%` }}
        />
      </div>
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

