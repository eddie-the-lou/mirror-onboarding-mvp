import { useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';

type Props = {
  name: string;
  age: number | null;
  onChange: (age: number | null) => void;
  onNext: () => void;
};

export function AgeInput({ name, age, onChange, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const display = age ?? '';
  const canContinue = typeof age === 'number' && age >= 13 && age <= 100;

  return (
    <Card>
      <p className="mirror-body-sm">
        How old are you{name ? `, ${name}` : ''}?
      </p>
      <div className="mt-6 space-y-4">
        <TextInput
          ref={inputRef}
          inputMode="numeric"
          pattern="[0-9]*"
          value={display}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            if (!value) {
              onChange(null);
              return;
            }
            const numeric = Number(value);
            onChange(Number.isNaN(numeric) ? null : numeric);
          }}
          placeholder="Your age"
        />
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </div>
    </Card>
  );
}

