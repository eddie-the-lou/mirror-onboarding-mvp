import { Card } from '../ui/Card';
import { OptionButton } from '../ui/OptionButton';
import { Button } from '../ui/Button';

type Props = {
  source: string;
  onChange: (source: string) => void;
  onNext: () => void;
};

const OPTIONS = [
  'A friend shared it with me',
  'I saw it on social media',
  "I saw someone\'s Mirror portrait",
  'Other',
];

export function SourceSelect({ source, onChange, onNext }: Props) {
  const canContinue = OPTIONS.includes(source);

  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        How did you find Mirror?
      </p>
      <div className="mt-6 space-y-3">
        {OPTIONS.map((option) => (
          <OptionButton
            key={option}
            selected={source === option}
            onClick={() => onChange(option)}
          >
            {option}
          </OptionButton>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </Card>
  );
}

