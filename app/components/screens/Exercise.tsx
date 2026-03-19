import { Card } from '../ui/Card';
import { OptionButton } from '../ui/OptionButton';
import type { ExerciseId } from '../../lib/exercises';
import { getExercise } from '../../lib/exercises';
import type { ABVersion } from '../../lib/types';

type Props = {
  id: ExerciseId;
  version: ABVersion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

export function Exercise({ id, version, selectedOptionId, onSelect }: Props) {
  const content = getExercise(version, id);

  const handleClick = (optionId: string) => {
    setTimeout(() => {
      onSelect(optionId);
    }, 350);
  };

  return (
    <Card>
      <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--mirror-muted)]">
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

