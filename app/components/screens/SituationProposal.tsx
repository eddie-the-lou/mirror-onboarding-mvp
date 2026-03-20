import { Card } from '../ui/Card';
import { OptionButton } from '../ui/OptionButton';
import { Button } from '../ui/Button';

type Props = {
  prompts: string[];
  selected: string;
  onSelect: (value: string) => void;
  onNext: () => void;
};

export function SituationProposal({ prompts, selected, onSelect, onNext }: Props) {
  const canContinue = Boolean(selected);

  return (
    <Card>
      <p className="mirror-body-sm">
        Choose one of these to answer.
      </p>
      <div className="mt-6 space-y-3">
        {prompts.map((prompt) => (
          <OptionButton
            key={prompt}
            selected={selected === prompt}
            onClick={() => onSelect(prompt)}
          >
            {prompt}
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

