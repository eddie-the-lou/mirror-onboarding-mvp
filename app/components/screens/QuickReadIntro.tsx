import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Props = {
  name: string;
  onNext: () => void;
};

export function QuickReadIntro({ name, onNext }: Props) {
  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        Alright{name ? `, ${name}` : ''}. Let&apos;s see how you read people.
      </p>
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext}>Start</Button>
      </div>
    </Card>
  );
}

