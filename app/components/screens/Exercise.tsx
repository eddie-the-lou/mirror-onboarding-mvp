import { Card } from '../ui/Card';
import { OptionButton } from '../ui/OptionButton';
import type { ExerciseId } from '../../lib/exercises';
import { getExercise } from '../../lib/exercises';

type Props = {
  id: ExerciseId;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

export function Exercise({ id, selectedOptionId, onSelect }: Props) {
  const content = getExercise(id);

  const handleClick = (optionId: string) => {
    setTimeout(() => {
      onSelect(optionId);
    }, 350);
  };

  return (
    <Card>
      <p className="mirror-body-sm whitespace-pre-line">
        {content.scenario}
      </p>
      <div className="mt-6 space-y-3">
        {content.options.map((option) => (
          <OptionButton
            key={option.id}
            selected={selectedOptionId === option.id}
            onClick={() => handleClick(option.id)}
          >
            {option.label}
          </OptionButton>
        ))}
      </div>
    </Card>
  );
}

