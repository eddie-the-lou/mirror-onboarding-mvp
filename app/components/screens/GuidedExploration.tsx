import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Props = {
  question: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onSubmit: (response: string) => Promise<void> | void;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error?: string }) => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionAlternativeLike = {
  transcript?: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

const NUDGES = [
  "That's a clear moment.",
  'I can picture that.',
  'That detail matters.',
  "That's specific — good.",
];

export function GuidedExploration({ question, value, onChange, placeholder, onSubmit }: Props) {
  const [showNudge, setShowNudge] = useState(false);
  const [nudge] = useState(() => NUDGES[Math.floor(Math.random() * NUDGES.length)]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    // Reset short-answer nudge when question changes.
    setShowNudge(false);
    // Do not sync finalTranscriptRef from `value` here while dictation is running.
    // `value` changes frequently during interim results, and resetting the ref would
    // break accumulation (causing repeated/garbled transcripts).
  }, [question]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (Recognition) {
      setSpeechSupported(true);
    }
  }, []);

  const handleContinue = async () => {
    if (submittingRef.current) return;
    const trimmed = value.trim();
    if (trimmed.length < 50 && !showNudge) {
      setShowNudge(true);
      return;
    }
    if (trimmed.length === 0) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await Promise.resolve(onSubmit(trimmed));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <p className="mb-5 mirror-heading">{question}</p>
      <textarea
        ref={textareaRef}
        className="mirror-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ??
          'e.g., We were at dinner and I noticed they got quiet after I mentioned something about the future...'
        }
      />
      {speechError ? (
        <p className="mt-3 text-sm text-[color:var(--mirror-fg-muted)]">
          Dictation error: {speechError}. If you’re on desktop Chrome, try again and speak immediately.
        </p>
      ) : null}
      {showNudge && value.trim().length < 50 ? (
        <p className="mt-3 text-sm font-medium text-[color:var(--mirror-body)]">
          {nudge} Can you tell me a bit more? The more detail you share, the more I can see.
        </p>
      ) : null}
      {submitting ? (
        <p className="mt-3 text-sm text-[color:var(--mirror-fg-muted)]">Generating next question…</p>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        {speechSupported ? (
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => {
              if (submittingRef.current) return;
              if (typeof window === 'undefined') return;
              setSpeechError(null);
              const w = window as Window & {
                webkitSpeechRecognition?: new () => SpeechRecognitionLike;
                SpeechRecognition?: new () => SpeechRecognitionLike;
              };
              const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
              if (!Recognition) return;

              // Toggle off if already listening.
              if (recognitionRef.current && listening) {
                recognitionRef.current.stop();
                return;
              }

              const recognition = new Recognition();
              recognition.lang = 'en-US';
              recognition.interimResults = true;
              recognition.continuous = true;

              finalTranscriptRef.current = value.trim();

              recognition.onstart = () => setListening(true);
              recognition.onend = () => setListening(false);
              recognition.onerror = (event) => {
                setListening(false);
                setSpeechError(event.error || 'unknown');
              };
              recognition.onresult = (event) => {
                let interim = '';

                // Append only NEW final chunks to the stored transcript.
                // Many engines (Chrome) rewrite interim results; finals should accumulate.
                for (let i = event.resultIndex; i < event.results.length; i += 1) {
                  const chunk = (event.results[i][0]?.transcript ?? '').trim();
                  if (!chunk) continue;
                  if (event.results[i].isFinal) {
                    finalTranscriptRef.current = [finalTranscriptRef.current, chunk]
                      .filter(Boolean)
                      .join(' ')
                      .replace(/\s+/g, ' ')
                      .trim();
                  } else {
                    interim = [interim, chunk].filter(Boolean).join(' ').trim();
                  }
                }

                const combined = [finalTranscriptRef.current, interim]
                  .filter(Boolean)
                  .join(' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                onChange(combined);
              };

              recognitionRef.current = recognition;
              recognition.start();
            }}
          >
            {listening ? 'Stop' : 'Speak'}
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="button"
          onClick={handleContinue}
          disabled={value.trim().length === 0 || submitting}
        >
          {submitting ? 'Continuing…' : 'Continue'}
        </Button>
      </div>
    </Card>
  );
}

