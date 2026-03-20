'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Message = { role: 'mirror' | 'user'; text: string };

type Props = {
  messages: Message[];
  currentQuestion: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (response: string) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
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

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; [0]: { transcript?: string } } };
};

const NUDGES = [
  "That's a clear moment.",
  'I can picture that.',
  "That detail matters.",
  "That's specific — good.",
];

export function InsightChat({
  messages,
  currentQuestion,
  draft,
  onDraftChange,
  onSubmit,
  loading,
  placeholder,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [nudge] = useState(() => NUDGES[Math.floor(Math.random() * NUDGES.length)]);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, currentQuestion, loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    if (w.SpeechRecognition || w.webkitSpeechRecognition) setSpeechSupported(true);
  }, []);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    const trimmed = draft.trim();
    if (trimmed.length < 50 && !showNudge) {
      setShowNudge(true);
      return;
    }
    if (trimmed.length === 0) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      onDraftChange('');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const displayMessages: Message[] = [
    ...messages,
    ...(currentQuestion && !loading ? [{ role: 'mirror' as const, text: currentQuestion }] : []),
  ];

  return (
    <Card className="!p-0 overflow-hidden">
    <div className="flex flex-col min-h-[360px] max-h-[55vh] p-4 sm:p-6">
      {/* Scrollable chat */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-6 pb-4 -mx-2 px-2"
      >
        {displayMessages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                m.role === 'user'
                  ? 'bg-[color:var(--mirror-accent)]/15 border border-[color:var(--mirror-accent)]/30 text-[color:var(--mirror-fg)]'
                  : 'bg-[var(--mirror-glass)] border border-[var(--mirror-glass-border)] text-[color:var(--mirror-body)]'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-[var(--mirror-glass)] border border-[var(--mirror-glass-border)]">
              <span className="inline-flex items-center gap-1" aria-label="Generating next question">
                <span className="w-2 h-2 rounded-full bg-[color:var(--mirror-muted)] animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-[color:var(--mirror-muted)] animate-bounce [animation-delay:200ms]" />
                <span className="w-2 h-2 rounded-full bg-[color:var(--mirror-muted)] animate-bounce [animation-delay:400ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 pt-2 border-t border-[var(--mirror-glass-border)]">
        {showNudge && draft.trim().length < 50 && (
          <p className="mb-2 text-sm font-medium text-[color:var(--mirror-body)]">
            {nudge} Can you tell me a bit more? The more detail you share, the more I can see.
          </p>
        )}
        {speechError && (
          <p className="mb-2 text-sm text-[color:var(--mirror-fg-muted)]">
            Dictation error: {speechError}. Try again on desktop Chrome.
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            className="mirror-input min-h-[88px] flex-1 resize-none"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder={placeholder ?? 'e.g., We were at dinner and I noticed they got quiet...'}
            disabled={submitting || loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            {speechSupported && (
              <Button
                variant="ghost"
                disabled={submitting || loading}
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
                  recognition.onerror = (e) => {
                    setListening(false);
                    setSpeechError(e.error || 'unknown');
                  };
                  recognition.onresult = (event: SpeechRecognitionEventLike) => {
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
                    onDraftChange(combined);
                  };
                  recognitionRef.current = recognition;
                  recognition.start();
                }}
              >
                {listening ? 'Stop' : 'Speak'}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!draft.trim() || submitting || loading}
            >
              {submitting || loading ? '…' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </Card>
  );
}
