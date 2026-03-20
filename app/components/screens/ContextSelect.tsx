import { Card } from '../ui/Card';
import { OptionButton } from '../ui/OptionButton';
import { Button } from '../ui/Button';

type Props = {
  prompt: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onNext: () => void;
};

export function ContextSelect({ prompt, options, selected, onSelect, onNext }: Props) {
  const canContinue = Boolean(selected);

  return (
    <Card>
      <p className="mirror-body-sm">{prompt}</p>
      <div className="mt-6 space-y-3">
        {options.map((option) => (
          <OptionButton
            key={option}
            selected={selected === option}
            onClick={() => onSelect(option)}
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

