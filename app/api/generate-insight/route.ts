import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildInsightPrompt } from '../../lib/buildInsightPrompt';
import type { OnboardingData } from '../../lib/types';

export async function POST(request: Request) {
  const data = (await request.json()) as OnboardingData;

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'INSIGHT_GENERATION_FAILED', errorCode: 'AUTH' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const systemPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'mirror-system-prompt.md'),
    'utf-8',
  );

  const userMessage = buildInsightPrompt(data);

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  async function callOnce(signal?: AbortSignal) {
    const response = await client.messages.create(
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      },
      signal ? { signal } : undefined,
    );

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('');

    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }

  function validate(raw: unknown) {
    if (!raw || typeof raw !== 'object') return false;
    const obj = raw as Record<string, unknown>;
    const quick_read = obj.quick_read as Record<string, unknown> | undefined;
    if (!quick_read || typeof quick_read !== 'object') return false;
    const qr = quick_read;
    if (typeof qr.exercise_1 !== 'string') return false;
    if (typeof qr.exercise_2 !== 'string') return false;
    if (typeof qr.exercise_3 !== 'string') return false;
    if (typeof qr.exercise_4 !== 'string') return false;
    if (typeof qr.perception_profile !== 'string') return false;
    if (typeof obj.insight !== 'string') return false;
    return true;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const raw = await callOnce(controller.signal);
    clearTimeout(timeout);
    if (!validate(raw)) {
      return new Response(
        JSON.stringify({ error: 'INSIGHT_GENERATION_FAILED', errorCode: 'PARSE' }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }
    const normalized = {
      quickRead: raw.quick_read,
      insight: raw.insight,
      fragments_touched: raw.fragments_touched,
      patterns_detected: raw.patterns_detected,
      hypotheses_to_explore: raw.hypotheses_to_explore,
    };
    return Response.json(normalized);
  } catch {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const raw = await callOnce(controller.signal);
      clearTimeout(timeout);
      if (!validate(raw)) {
        return new Response(
          JSON.stringify({ error: 'INSIGHT_GENERATION_FAILED', errorCode: 'PARSE' }),
          { status: 500, headers: { 'content-type': 'application/json' } },
        );
      }
      const normalized = {
        quickRead: raw.quick_read,
        insight: raw.insight,
        fragments_touched: raw.fragments_touched,
        patterns_detected: raw.patterns_detected,
        hypotheses_to_explore: raw.hypotheses_to_explore,
      };
      return Response.json(normalized);
    } catch {
      return new Response(
        JSON.stringify({ error: 'INSIGHT_GENERATION_FAILED', errorCode: 'PARSE' }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }
  }

}

