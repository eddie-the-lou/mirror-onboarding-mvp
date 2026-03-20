import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { InterviewPath } from '../../lib/types';

type Body = {
  path: InterviewPath;
  stepIndex: number;
  contextSelections: string[];
  situationPromptSelected: string;
  lastQuestion: string;
  lastResponse: string;
  priorFreeResponses: Array<{ question: string; response: string }>;
  threshold: number; // 0..1
  maxTurns: number; // total allowed turns for this path
  currentTurn: number; // 1-indexed
  isLastPlannedTurn: boolean;
};

function buildInstruction(path: InterviewPath, stepIndex: number) {
  // Hybrid interview: generate next question + score sufficiency.
  const base =
    [
      'You must return STRICT JSON only.',
      'No acknowledgment. No summary. No therapy language.',
      'Do not shame or scold the user; do not accuse them of "half-assing" or being dishonest.',
      '1-2 sentences max for the next question.',
      'If the user has given a specific, concrete response, prefer to proceed (high evidenceScore) rather than asking for more. Only ask follow-ups when key evidence is genuinely missing.',
      'When you do ask, go straight to the question. Avoid "Zoom in...", "Focus on...", "Pick a concrete example..." — just ask. 2-5 sentences from the user is often enough.',
      'Avoid generic questions.',
      'Do NOT make up backstory or assume a "learned" belief; if you offer a hypothesis, phrase it as a question with multiple plausible options.',
      '',
      'REDIRECT RULE (when evidence is genuinely thin):',
      'If evidenceScore < threshold and you are asking another question, do NOT say you are tracking or missing something.',
      'Ask ONE targeted question to fill the biggest missing evidence slot (scene / internal state / choice point / consequence). Be direct.',
    ].join(' ');

  const byPath: Record<InterviewPath, string> = {
    A: `Path A (patterns): specificity, sequence, and self-role. Step ${stepIndex + 1}.`,
    B: `Path B (relationship): their read of the other person, then their own internal state, then the counterfactual. Step ${stepIndex + 1}.`,
    C: `Path C (situation): emotional worst-case, default coping, and the gap. Step ${stepIndex + 1}.`,
  };

  return `${base}\n\n${byPath[path]}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'NEXT_QUESTION_FAILED', errorCode: 'AUTH' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const systemPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'mirror-system-prompt.md'),
    'utf-8',
  );

  const instruction = buildInstruction(body.path, body.stepIndex);

  const userMessage = `
You are generating the next question in an onboarding interview.

Path: ${body.path}
Context selections: ${body.contextSelections.filter(Boolean).join(' | ') || '(none)'}
Situation prompt selected: ${body.situationPromptSelected || '(none)'}

Prior Q/A:
${body.priorFreeResponses
  .map((x, i) => `Q${i + 1}: ${x.question}\nA${i + 1}: ${x.response}`)
  .join('\n\n') || '(none)'}

Most recent:
Q: ${body.lastQuestion}
A: ${body.lastResponse}

Scoring task:
- Compute an evidenceScore from 0.0 to 1.0 for whether you have enough concrete evidence to form a useful first insight.
- Evidence means: a specific moment or scene, plus some sense of internal state (what they felt/thought). A choice point or consequence strengthens the score but is not required. If the user has given a concrete, specific response with real detail, score generously (≥ ${body.threshold}).
- If this is the last planned turn and evidenceScore < ${body.threshold} AND currentTurn < maxTurns, set shouldContinue=true and ask one more targeted question that fills the biggest missing evidence slot (and obey the REDIRECT RULE).
- Otherwise set shouldContinue=false.

Parameters:
- threshold: ${body.threshold}
- currentTurn: ${body.currentTurn}
- maxTurns: ${body.maxTurns}
- isLastPlannedTurn: ${body.isLastPlannedTurn ? 'true' : 'false'}

${instruction}

Return STRICT JSON only:
{
  "nextQuestion": "string (empty if shouldContinue=false)",
  "evidenceScore": 0.0,
  "shouldContinue": true
}
`;

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 220,
      temperature: 0.6,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('')
      .trim();

    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as {
      nextQuestion?: unknown;
      evidenceScore?: unknown;
      shouldContinue?: unknown;
    };

    const nextQuestion =
      typeof parsed.nextQuestion === 'string' ? parsed.nextQuestion.trim() : '';
    const evidenceScoreRaw =
      typeof parsed.evidenceScore === 'number' ? parsed.evidenceScore : null;
    const evidenceScore =
      evidenceScoreRaw === null ? null : Math.max(0, Math.min(1, evidenceScoreRaw));
    const shouldContinue = parsed.shouldContinue === true;

    return Response.json({ nextQuestion, evidenceScore, shouldContinue });
  } catch {
    return new Response(
      JSON.stringify({ error: 'NEXT_QUESTION_FAILED', errorCode: 'MODEL' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}

