import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Props = {
  name: string;
  insight: string | null;
  isPlaceholder?: boolean;
  onContinue: () => void;
};

export function InsightReveal({ name, insight, isPlaceholder, onContinue }: Props) {
  return (
    <Card>
      <p className="text-sm font-medium text-[color:var(--mirror-fg)]">
        Now — here&apos;s what I see when I put that together with what you told me{name ? `, ${name}` : ''}.
      </p>
      <p className="mt-5 text-sm leading-relaxed text-[color:var(--mirror-fg)] whitespace-pre-line">
        {insight ??
          (isPlaceholder
            ? "This is where I’ll show you the integrated insight — how you read people, plus what your stories reveal about how you operate. Once the insight engine is wired up, this card will be a real read of you."
            : 'No insight available.')}
      </p>
      <div className="mt-8 flex justify-end">
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </Card>
  );
}

