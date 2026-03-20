'use client';

type Props = {
  phase: 'quickRead' | 'insight';
  quickReadStep: number;
  quickReadTotal: number;
  insightStep: number;
  insightTotal: number;
};

const QUICK_READ_WEIGHT = 0.35; // 35% of bar for quick read segment
const INSIGHT_WEIGHT = 0.65; // 65% for insight segment

export function ProgressBar({ phase, quickReadStep, quickReadTotal, insightStep, insightTotal }: Props) {
  const safeQuickTotal = Math.max(1, quickReadTotal);
  const safeInsightTotal = Math.max(1, insightTotal);
  const quickReadPct = (quickReadStep / safeQuickTotal) * 100;
  const insightPct = (insightStep / safeInsightTotal) * 100;

  if (phase === 'quickRead') {
    return (
      <div
        className="mb-5"
        role="progressbar"
        aria-valuenow={quickReadStep}
        aria-valuemin={1}
        aria-valuemax={safeQuickTotal}
        aria-label={`Quick read: step ${quickReadStep} of ${quickReadTotal}`}
      >
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--mirror-glass-border)] flex">
          <div
            className="h-full rounded-l-full bg-[color:var(--mirror-accent)] transition-all duration-400 ease-out"
            style={{ width: `${quickReadPct}%` }}
          />
        </div>
      </div>
    );
  }

  // Insight phase: two segments — quick read (complete) + insight (in progress)
  const segment1Width = QUICK_READ_WEIGHT * 100;
  const segment2Filled = (Math.min(100, insightPct) / 100) * INSIGHT_WEIGHT * 100;

  return (
    <div
      className="mb-5"
      role="progressbar"
      aria-valuenow={insightStep}
      aria-valuemin={1}
      aria-valuemax={safeInsightTotal}
      aria-label={`Insight: step ${insightStep} of ${insightTotal}`}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--mirror-glass-border)] flex">
        {/* Quick read segment — always full */}
        <div
          className="h-full bg-[color:var(--mirror-accent)] transition-all duration-400 ease-out shrink-0"
          style={{ width: `${segment1Width}%` }}
        />
        {/* Insight segment — fills based on progress */}
        <div
          className="h-full rounded-r-full bg-[color:var(--mirror-accent)] transition-all duration-400 ease-out shrink-0"
          style={{ width: `${segment2Filled}%` }}
        />
      </div>
    </div>
  );
}
