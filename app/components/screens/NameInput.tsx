import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';

type Props = {
  name: string;
  onChange: (name: string) => void;
  onNext: () => void;
};

export function NameInput({ name, onChange, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [local, setLocal] = useState(name);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setLocal(name);
  }, [name]);

  const canContinue = local.trim().length > 0;

  return (
    <Card>
      <p className="mirror-body-sm">
        What should I call you?
      </p>
      <div className="mt-6 space-y-4">
        <TextInput
          ref={inputRef}
          value={local}
          onChange={(e) => {
            const next = e.target.value;
            setLocal(next);
            onChange(next);
          }}
          placeholder="First name"
          autoComplete="given-name"
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

