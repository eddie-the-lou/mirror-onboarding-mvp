import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function FirstAction() {
  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        Two things will build your mirror.
      </p>
      <div className="mt-6 space-y-3">
        <Button variant="ghost">Today&apos;s Scenario</Button>
        <p className="text-xs text-[color:var(--mirror-muted)]">
          Your first scenario will be ready tomorrow.
        </p>
        <div className="h-4" />
        <Button variant="ghost">Chat with Mirror</Button>
        <p className="text-xs text-[color:var(--mirror-muted)]">
          Mirror is ready whenever you are. Coming soon.
        </p>
      </div>
    </Card>
  );
}

