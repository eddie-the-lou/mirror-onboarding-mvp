import { useMemo, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

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

type SpeechRecognitionAlternativeLike = { transcript?: string };
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};
type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};
type SpeechRecognitionEventLike = { resultIndex: number; results: SpeechRecognitionResultListLike };

type Turn = { role: 'you' | 'mirror'; text: string };

export function AccuracyScreen({
  insight,
}: {
  insight: string;
}) {
  const [score, setScore] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [currentInsight, setCurrentInsight] = useState(insight);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);

  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');

  const speakSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const w = window as Window & {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  const canSend = Boolean(score) && draft.trim().length > 0 && !loading;

  return (
    <Card>
      <p className="text-xs text-[color:var(--mirror-muted)]">Your report</p>
      <p className="mt-3 text-base leading-relaxed text-[color:var(--mirror-fg)] whitespace-pre-line">
        {currentInsight}
      </p>

      <div className="mt-8">
        <p className="text-sm leading-relaxed text-[color:var(--mirror-muted)]">
          How accurate does this feel?
        </p>
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="text-xs text-[color:var(--mirror-muted)]">1</p>
            <p className="text-lg font-medium text-[color:var(--mirror-fg)]">
              {score ?? '—'}
              <span className="text-xs text-[color:var(--mirror-muted)]">/10</span>
            </p>
            <p className="text-xs text-[color:var(--mirror-muted)]">10</p>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={score ?? 5}
            onChange={(e) => setScore(Number(e.target.value))}
            className="mt-3 w-full accent-[color:var(--mirror-accent)]"
          />
        </div>
        <p className="mt-4 text-xs text-[color:var(--mirror-muted)]">
          This is our first conversation, so it may not be perfect yet. Thankfully, Mirror gets sharper the more you use it and grows with you.
        </p>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-[color:var(--mirror-muted)]">
            What felt right? What felt off? Be concrete.
          </p>
          <textarea
            className="min-h-[110px] w-full rounded-xl border border-[color-mix(in_oklab,var(--mirror-muted)_60%,transparent)] bg-[color:var(--mirror-bg)] px-4 py-3 text-sm text-[color:var(--mirror-fg)] placeholder:text-[color:var(--mirror-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mirror-accent)]"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g., The part about X is right, but the part about Y misses because…"
          />

          {speechError ? (
            <p className="text-xs text-[color:var(--mirror-muted)]">Dictation error: {speechError}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3">
            {speakSupported ? (
              <Button
                type="button"
                variant="ghost"
                disabled={loading}
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  setSpeechError(null);
                  const w = window as Window & {
                    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
                    SpeechRecognition?: new () => SpeechRecognitionLike;
                  };
                  const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
                  if (!Recognition) return;

                  if (recognitionRef.current && listening) {
                    recognitionRef.current.stop();
                    return;
                  }

                  finalTranscriptRef.current = draft.trim();
                  const recognition = new Recognition();
                  recognition.lang = 'en-US';
                  recognition.interimResults = true;
                  recognition.continuous = true;
                  recognition.onstart = () => setListening(true);
                  recognition.onend = () => setListening(false);
                  recognition.onerror = (event) => {
                    setListening(false);
                    setSpeechError(event.error || 'unknown');
                  };
                  recognition.onresult = (event) => {
                    let interim = '';
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
                    setDraft(combined);
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
              disabled={!canSend}
              onClick={async () => {
                if (!score) return;
                const feedback = draft.trim();
                if (!feedback) return;

                setTurns((t) => [...t, { role: 'you', text: `(${score}/10) ${feedback}` }]);
                setDraft('');
                setLoading(true);
                try {
                  const res = await fetch('/api/pushback', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      insight: currentInsight,
                      score,
                      feedback,
                      history: turns,
                    }),
                  });
                  if (!res.ok) return;
                  const json = await res.json();
                  const message = typeof json?.message === 'string' ? json.message : null;
                  const revisedInsight =
                    typeof json?.revisedInsight === 'string' ? json.revisedInsight : null;
                  if (message) setTurns((t) => [...t, { role: 'mirror', text: message }]);
                  if (revisedInsight) setCurrentInsight(revisedInsight);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? 'Thinking…' : 'Send feedback'}
            </Button>
          </div>
        </div>
      </div>

      {turns.length ? (
        <div className="mt-8 space-y-3">
          <p className="text-xs text-[color:var(--mirror-muted)]">Conversation</p>
          <div className="space-y-3">
            {turns.map((t, idx) => (
              <p
                key={idx}
                className="text-xs leading-relaxed whitespace-pre-line text-[color:var(--mirror-muted)]"
              >
                <span className="text-[color:var(--mirror-fg)]">
                  {t.role === 'you' ? 'You' : 'Mirror'}:
                </span>{' '}
                {t.text}
              </p>
            ))}
          </div>
        </div>
      ) : null}

    </Card>
  );
}

