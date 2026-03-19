import { Card } from '../ui/Card';
import { OptionButton } from '../ui/OptionButton';
import { Button } from '../ui/Button';

type Props = {
  gender: string;
  onChange: (gender: string) => void;
  onNext: () => void;
};

const OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export function GenderSelect({ gender, onChange, onNext }: Props) {
  const canContinue = OPTIONS.includes(gender);

  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        What&apos;s your gender?
      </p>
      <div className="mt-6 space-y-3">
        {OPTIONS.map((option) => (
          <OptionButton
            key={option}
            selected={gender === option}
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

