import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Props = {
  quickRead:
    | {
        exercise_1: string;
        exercise_2: string;
        exercise_3: string;
        exercise_4: string;
        perception_profile: string;
      }
    | null;
  isPlaceholder?: boolean;
  onContinue: () => void;
};

export function QuickReadReveal({ quickRead, isPlaceholder, onContinue }: Props) {
  if (!quickRead) {
    return (
      <Card>
        <p className="mirror-heading">
          First — here&apos;s how you read people.
        </p>
        <p className="mt-4 mirror-body-sm">
          {isPlaceholder
            ? "I’m not connected yet — this is where your quick read breakdown will appear once the insight engine is live."
            : 'No quick read results available.'}
        </p>
        <div className="mt-8 flex justify-end">
          <Button onClick={onContinue}>Continue</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-sm font-medium text-[color:var(--mirror-fg)]">
        First — here&apos;s how you read people.
      </h2>
      <p className="mt-5 text-sm leading-relaxed text-[color:var(--mirror-fg)]">
        {quickRead.perception_profile}
      </p>

      <div className="mt-6 rounded-2xl border border-[color-mix(in_oklab,var(--mirror-muted)_60%,transparent)] p-4">
        <p className="mirror-label">What I based this on</p>
        <div className="mt-3 space-y-3 mirror-body-sm">
          <p>{quickRead.exercise_1}</p>
          <p>{quickRead.exercise_2}</p>
          <p>{quickRead.exercise_3}</p>
          <p>{quickRead.exercise_4}</p>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </Card>
  );
}

