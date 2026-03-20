import { Card } from '../ui/Card';

export function AccuracyScreen({ insight }: { insight: string }) {
  return (
    <Card>
      <p className="mirror-label">Your report</p>
      <p className="mt-4 mirror-body whitespace-pre-line">{insight}</p>
    </Card>
  );
}

