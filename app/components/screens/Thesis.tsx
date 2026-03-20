import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Props = {
  onNext: () => void;
};

export function Thesis({ onNext }: Props) {
  return (
    <Card>
      <p className="mirror-body">
        Mirror sees the patterns in how you think, feel, and relate to people — including the ones
        you can&apos;t see on your own.
      </p>
      <p className="mt-6 mirror-body">
        First, I&apos;ll see how you read other people. Then I&apos;ll learn how you see your own
        life. By the end, I&apos;ll show you something about yourself you probably haven&apos;t
        seen before.
      </p>
      <div className="mt-10 flex justify-end">
        <Button onClick={onNext}>Let&apos;s go</Button>
      </div>
    </Card>
  );
}

