# Mirror Onboarding MVP — Cursor Build Prompt

Copy everything below this line and paste it into Cursor as your initial prompt. Make sure all referenced files (mirror-system-prompt.md, mirror-quick-read-exercises.md, mirror-onboarding-spec.md, mirror-insight-prompt-template.md) are in your project directory so Cursor can reference them.

---

## What We're Building

A web app for the Mirror onboarding experience — a sequential, multi-screen flow that collects user data through a mix of multiple-choice selections and free-text inputs, sends it to the Anthropic Claude API, and displays AI-generated results as styled visual cards.

The app is a consumer-facing product — it needs to feel premium, minimal, and polished. Not a dashboard, not an admin tool. Think: a beautifully designed personality assessment that feels like a conversation.

## Tech Stack

- **Next.js 14+ (App Router)** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for screen transitions and animations
- **Anthropic Claude API** (claude-sonnet-4-20250514) for insight generation
- **Vercel** for deployment
- No database needed for MVP — all data lives in client state during the session.

## Design System

The visual identity is premium and minimal. Dark background, light text, subtle gradients. The feeling should be closer to a luxury product than a tech app.

- **Background:** Near-black (#0a0a0a or similar dark tone)
- **Primary text:** Off-white (#f5f5f5)
- **Secondary text:** Muted gray (#888888)
- **Accent color:** A subtle warm tone — soft gold, muted amber, or warm white for highlights and interactive elements
- **Typography:** Clean sans-serif. Inter or similar. Headings can be slightly larger but never shouty. Body text should feel like reading a letter, not a UI.
- **Spacing:** Generous. Every screen should breathe. Content should be vertically centered or near-centered on the viewport.
- **Transitions:** Smooth fade or slide transitions between screens. Nothing flashy — just enough motion to feel alive. Use Framer Motion.
- **Buttons:** Minimal. No heavy borders or drop shadows. Text-based or lightly outlined. Single-select option buttons should feel like tapping a choice, not clicking a form element.
- **Cards (for the reveal):** The quick read breakdown and insight should display on styled cards with subtle background differentiation — slightly lighter than the page background, maybe with a very faint border or glow. These cards need to feel like objects worth screenshotting.

## App Structure

The app is a single linear flow with branching logic in the middle. Think of it as a state machine:

```
thesis → exercise_1 → exercise_2 → exercise_3 → exercise_4 → intent_selection → [PATH A|B|C|D context screens] → [PATH A|B|C|D guided exploration] → loading → reveal_quick_read → accuracy_check
```

### State Management

Use React state (useState/useReducer) to manage:
- Current screen index
- User data object (accumulates as they progress)
- A/B test version (randomly assigned on load)
- Path selection (A, B, C, or D)
- API response (quick read breakdown + insight)

The complete data model:

```typescript
interface OnboardingData {
  user: {
    name: string;
    age: number;
    gender: string;
    source: string;
  };
  abVersion: 'A' | 'B';
  quickRead: {
    exercise1: { answer: string; };
    exercise2: { answer: string; };
    exercise3: { answer: string; };
    exercise4: { answer: string; };
  };
  interview: {
    intent: string;
    path: 'A' | 'B' | 'C';
    contextSelections: string[];
    situationPromptSelected: string;
    freeResponses: Array<{ question: string; response: string; }>;
  };
  reaction: {
    rating: string;
    pushbackText: string | null;
  };
  results: {
    quickReadBreakdown: any;
    insight: string;
    fragmentsTouched: any;
    patternsDetected: string[];
  } | null;
}
```

## Screen-by-Screen Implementation

Build each screen as a component. Use a parent component that manages the current screen index and transitions.

### Screen 1: Thesis
Full-viewport centered text. Two paragraphs:

"Mirror sees the patterns in how you think, feel, and relate to people — including the ones you can't see on your own."

"First, I'll see how you read other people. Then I'll learn how you see your own life. By the end, I'll show you something about yourself you probably haven't seen before."

Button: "Let's go"

The text should appear with a subtle fade-in. This is the user's first impression — it needs to feel intentional and unhurried.

### Screen 2: Demographics Intro
Simple centered text: "First, some quick basics."
Auto-advance after a brief pause (1 second) or tap to continue.

### Screen 3: Name
"What should I call you?"
Single text input, centered. Auto-focus on the input. Continue button appears when input is non-empty.

### Screen 4: Age
"How old are you, [name]?"
Number input or a clean scroll selector. Use the name they entered.

### Screen 5: Gender
"What's your gender?"
Four option buttons stacked vertically: Male, Female, Non-binary, Prefer not to say.

### Screen 6: Source
"How did you find Mirror?"
Four option buttons: A friend shared it with me, I saw it on social media, I saw someone's Mirror portrait, Other.

### Screen 7: Quick Read Intro
"Alright, [name]. Let's see how you read people."
Button: "Start"

### Screens 8-11: Quick Read Exercises

Each exercise screen has:
- The scenario text at the top (styled as a reading passage — slightly larger text, comfortable line height)
- A question in bold below
- Four option buttons below the question

No feedback is shown. When the user selects an option, briefly highlight their choice (subtle color change), then transition to the next screen after a short delay (300-500ms).

**The exercise content depends on the A/B version.** Reference the file `mirror-quick-read-exercises.md` for the exact scenario text and options for both Version A and Version B. Exercises 3 and 4 are identical across versions.

### Screen 12: Transition + Intent Selection
Two lines of text:
"Good. I'm getting a read on how you see other people. Now I want to learn how you see your own life."

"What do you want Mirror to help you with?"

Four option buttons:
- "Help me understand what patterns are holding me back"
- "Help me navigate a relationship in my life"
- "Help me think through something I'm dealing with"
- "I just want to see how well this reads me"

The user's selection determines the path (A, B, C, or D) for all subsequent screens.

### Screens 13-19: Path-Dependent Interview

Reference `mirror-onboarding-spec.md` for the complete specification of each path. The key implementation details:

**Multiple-choice context screens (Screens 13-14):** Same component pattern as the quick read — question text, option buttons. The options change based on prior selections (e.g., Path A Screen 14 options depend on what was selected on Screen 13).

**Situation proposal (Screen 15, Paths A and B only):** Three options based on the combination of context selections. For MVP, implement the most common combinations (romantic relationships for Path A, partner for Path B). For combinations without pre-written prompts, use these fallback prompts:

Path A fallback prompts:
- "Think about the last time this pattern showed up. What happened?"
- "Think about what someone close to you would say about this pattern."
- "Think about the moment you first noticed this was a pattern, not a one-time thing."

Path B fallback prompts:
- "Describe a recent moment that captures what's going on between you two."
- "What's the thing you most want them to understand about you?"
- "If they were here right now, what do you think they'd say is the problem?"

**Path C, Screen 15:** Skip the proposal — show a free-text input: "Tell me what's happening — the situation and the hard part — in whatever way feels natural."

**Free-response screens (Screens 16-19):** Each has:
- A brief acknowledgment line above the question, styled differently (lighter text, slightly italic or different weight) to feel like Mirror speaking. For MVP, use template-based acknowledgments — cycle through: "That's a clear moment.", "I can picture that.", "That detail matters.", "That's specific — good."
- The question text (generate dynamically based on the user's previous response; keep screen count fixed per path)
- A large free-text area (textarea, not a single-line input). 4-6 rows visible. Placeholder text modeling expected depth.
- A continue button that activates when the response has at least 1 character

**Path C has fewer free-response screens** (3 instead of 4). Handle this in the screen flow logic.

### Screen 20: Loading
"Give me a moment. I'm putting something together for you."

Show a subtle pulsing animation — not a spinner. Something atmospheric. A gentle glow that pulses, or the text "thinking" with a slow ellipsis. The user should feel like something meaningful is being computed.

Trigger the insight generation API call automatically after the user submits the final free-response screen for their path.

### API Integration

**Endpoint:** POST to `/api/generate-insight` (Next.js API route)

The API route should:
1. Receive the complete onboarding data from the client
2. Construct the user message using the template from `mirror-insight-prompt-template.md`, populated with the actual data
3. Call the Anthropic API with:
   - System message: contents of `mirror-system-prompt.md`
   - User message: the populated template
   - Model: claude-sonnet-4-20250514
   - Max tokens: 2000
   - Temperature: 0.7
4. Parse the JSON response
5. Return the parsed results to the client

**Important:** The system prompt should be read from a file in a `/prompts` directory, not hardcoded. This makes iteration easy.

**Error handling:** If the API call fails, retry once. If it fails again, show: "Something went wrong. Let me try again." with a retry button.

The API route needs the ANTHROPIC_API_KEY in environment variables (.env.local).

```typescript
// /app/api/generate-insight/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  const data = await request.json();
  
  const systemPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'mirror-system-prompt.md'), 
    'utf-8'
  );
  
  const userMessage = buildInsightPrompt(data);
  
  const client = new Anthropic();
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  
  const text = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
  
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  
  return Response.json(parsed);
}
```

The `buildInsightPrompt` function should follow the template in `mirror-insight-prompt-template.md` — it takes the complete onboarding data and formats it into the structured prompt that asks the AI to generate the quick read breakdown and insight.

### Screen 22: Quick Read Breakdown

Header: "First — here's how you read people."

Display a single cohesive synthesis paragraph (perception profile) first, then a compact “What I based this on” section with the four per-exercise signals underneath.

Tone constraints:
- No internal IDs or backend labels in user-visible copy.
- Avoid absolutist language (“entirely”, “always”, “you missed X”). Use calibrated language (“you tended to”, “you leaned toward”, “this points to”).

Share button that renders this section as a shareable image.

### Screen 23: The Insight

Header: "Now — here's what I see when I put that together with what you told me."

The insight text from the API response on a premium styled card. This is the most important visual in the app.

The card should:
- Address the user by name
- Display as flowing prose
- Use slightly larger, more readable typography
- Have a subtle background treatment (slight gradient, faint border, or soft glow)
- Include a share button with Mirror branding on the exported image

### Screen 24: Reaction

Replace this screen with an iterative accuracy check:

Copy: "How accurate does this feel?"

- 1–10 scale
- Feedback box (“What felt right? What felt off?”) with dictation
- Keep the full report visible on the same screen
- Include: "This is our first conversation, so it may not be perfect yet. Thankfully, Mirror gets sharper the more you use it and grows with you."
- Each feedback send triggers a refinement call that updates the report in-place until the user is satisfied.

Four option buttons:
- "Yes — that's exactly it"
- "Partially — some of it lands"
- "No — that's not what's happening"
- "I need to think about that"

If "Partially" or "No": Show text input "What part doesn't fit?" and fire a follow-up API call to `/api/pushback` with the insight and their pushback text. Display Mirror's 2-3 sentence response. Then show continue button.

If "Yes" or "I need to think about that": Proceed directly.

Remove Screen 25–26 for this MVP iteration. The flow ends after the iterative accuracy check.

These are placeholder endpoints for the MVP.

## File Structure

```
/app
  /page.tsx                    — Main onboarding flow controller
  /api
    /generate-insight
      /route.ts                — Insight generation API endpoint
    /pushback
      /route.ts                — Pushback response API endpoint
  /components
    /screens
      /Thesis.tsx
      /DemographicsIntro.tsx
      /NameInput.tsx
      /AgeInput.tsx
      /GenderSelect.tsx
      /SourceSelect.tsx
      /QuickReadIntro.tsx
      /Exercise.tsx            — Reusable for all 4 exercises
      /Transition.tsx
      /IntentSelect.tsx
      /ContextSelect.tsx       — Reusable for context gathering
      /SituationProposal.tsx
      /GuidedExploration.tsx   — Reusable for free-response questions
      /SignupGate.tsx
      /Loading.tsx
      /QuickReadReveal.tsx
      /InsightReveal.tsx
      /Reaction.tsx
      /MirrorDisplay.tsx
      /FirstAction.tsx
    /ui
      /Button.tsx
      /OptionButton.tsx
      /TextInput.tsx
      /TextArea.tsx
      /Card.tsx
      /ShareButton.tsx
  /lib
    /types.ts                  — TypeScript interfaces
    /exercises.ts              — Exercise content for both A/B versions
    /paths.ts                  — Interview path content (context options, prompts, questions)
    /buildInsightPrompt.ts     — Constructs the API prompt from user data
  /prompts
    /mirror-system-prompt.md
    /mirror-insight-prompt-template.md
/public
  — Static assets
```

## Key Implementation Notes

1. **Screen transitions should feel smooth.** Use Framer Motion AnimatePresence with a fade or subtle slide. ~300ms timing. Each screen animates in, previous animates out.

2. **Free-text areas should feel inviting.** Large, comfortable, dark-themed textarea with a subtle border. Auto-focus when screen appears. Placeholder in lighter gray.

3. **Option buttons should have clear selected states.** When tapped, selected option gets a subtle highlight (border color or background shift). Unselected options dim slightly. Brief delay (300-500ms) before advancing to next screen.

4. **The loading screen should feel intentional.** Not a spinner. A subtle atmospheric pulse or glow. The user should feel something meaningful is being computed.

5. **The reveal cards are the most important visuals.** Premium feel. Subtle card elevation, refined typography, slight background differentiation. These are what users will screenshot and share.

6. **Share functionality:** Use the Web Share API where available (mobile), with a fallback to "Copy to clipboard." For image sharing, use html-to-image or similar to render the card as a PNG with subtle Mirror branding.

7. **Mobile-first.** Most users will be on their phone. Design for mobile viewport first. Touch targets should be generous (min 44px). Text readable without zooming.

8. **A/B assignment:** Random on first load, persisted in state for the session. Determines exercise content for Screens 8-9.

## Build Order

1. Set up Next.js project with Tailwind and Framer Motion
2. Build the screen flow infrastructure — parent component managing current screen, transitions, data accumulation
3. Build Act 1 (thesis through quick read) — simplest screens, validates visual design
4. Build the API route — get insight generation working with a hardcoded test payload
5. Build results generation + reveal — connect API, get full end-to-end flow working
6. Build Act 2 (branching interview) — start with Path A only, then add B, C, D
7. Polish transitions, share functionality, mobile testing

Start building. Reference the supporting files in the /prompts directory and the exercise/path content files for exact copy and branching logic.
