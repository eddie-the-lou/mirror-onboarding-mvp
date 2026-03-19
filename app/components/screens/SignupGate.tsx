import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';

type Props = {
  name: string;
  email: string;
  onChangeEmail: (email: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function SignupGate({ name, email, onChangeEmail, onSubmit, loading }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [local, setLocal] = useState(email);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setLocal(email);
  }, [email]);

  const valid = /\S+@\S+\.\S+/.test(local);

  return (
    <Card>
      <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        I see something{name ? `, ${name}` : ''}. There&apos;s a pattern here — and it connects to
        how you read people in ways you probably haven&apos;t considered.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[color:var(--mirror-muted)]">
        To show you what I found, create your account.
      </p>
      <div className="mt-6 space-y-4">
        <TextInput
          ref={inputRef}
          type="email"
          value={local}
          onChange={(e) => {
            const value = e.target.value;
            setLocal(value);
            onChangeEmail(value);
          }}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={!valid || loading}>
            {loading ? 'Thinking…' : 'Show me'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

