import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

type Body = {
  insight: string;
  score: number;
  feedback: string;
  history?: Array<{ role: 'you' | 'mirror'; text: string }>;
};

export async function POST(request: Request) {
  const { insight, score, feedback, history } = (await request.json()) as Body;

  const systemPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'mirror-system-prompt.md'),
    'utf-8',
  );

  const transcript =
    history?.length
      ? history.map((t) => `${t.role === 'you' ? 'User' : 'Mirror'}: ${t.text}`).join('\n')
      : '(none)';

  const userMessage = `
You previously showed the user this report:

"${insight}"

They rated accuracy ${score}/10 and gave this feedback:
"${feedback}"

Prior refinement turns (if any):
${transcript}

Your task:
1) Write a short Mirror reply (2-4 sentences) that engages their feedback directly.
2) Produce a revised version of the report that better fits what they said.

Rules:
- Do NOT be therapy-ish.
- Be specific and concrete.
- Do NOT mention "JSON" or "fields".

Return STRICT JSON:
{
  "message": "…",
  "revisedInsight": "…"
}
`;

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await client.messages.create(
      {
        model: 'claude-3.7-sonnet',
        max_tokens: 700,
        temperature: 0.6,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('')
      .trim();

    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as { message?: string; revisedInsight?: string };
    return Response.json({
      message: parsed.message ?? '',
      revisedInsight: parsed.revisedInsight ?? insight,
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'PUSHBACK_FAILED' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}

