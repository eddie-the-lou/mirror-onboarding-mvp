import { Card } from '../ui/Card';
import { OptionButton } from '../ui/OptionButton';
import { Button } from '../ui/Button';
import { INTENT_OPTIONS } from '../../lib/paths';
import type { InterviewPath } from '../../lib/types';

type Props = {
  selectedIntent: string;
  selectedPath: InterviewPath | null;
  onSelect: (intent: string, path: InterviewPath) => void;
  onNext: () => void;
};

export function IntentSelect({ selectedIntent, selectedPath, onSelect, onNext }: Props) {
  const canContinue = Boolean(selectedIntent && selectedPath);

  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        Good. I&apos;m getting a read on how you see other people. Now I want to learn how you see
        your own life.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        What do you want Mirror to help you with?
      </p>
      <div className="mt-6 space-y-3">
        {INTENT_OPTIONS.map((option) => (
          <OptionButton
            key={option.label}
            selected={selectedIntent === option.label}
            onClick={() => onSelect(option.label, option.path)}
          >
            {option.label}
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

