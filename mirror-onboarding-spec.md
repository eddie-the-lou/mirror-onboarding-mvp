# Mirror — Onboarding Build Spec

## Overview

This document specifies every screen in the Mirror onboarding experience. It is the complete build reference for the MVP. A developer should be able to build the entire onboarding from this document plus the three supporting files:

- `mirror-system-prompt.md` — The AI's system prompt
- `mirror-insight-prompt-template.md` — The prompt template for generating the insight
- `mirror-quick-read-exercises.md` — The exercise content

## Technical Requirements

- A frontend that renders sequential screens with branching logic
- An input system supporting: single-select buttons and free-text fields (with optional dictation)
- An API integration with a frontier LLM (Claude or equivalent) for three calls: next-question generation during the insight chat (after each user response), insight generation after the final response, and report refinement on feedback
- A results display that renders the quick read breakdown and the insight as visual cards

## Data Model

The onboarding collects the following data, which is passed to the insight generation API call:

```
{
  user: {
    name: string,
    age: number,
    gender: string,
    source: string
  },
  quick_read: {
    exercise_1: {
      scenario_id: string,
      user_answer: string,
      correct_answer?: string,       // Exercise 3 only
      result: "correct" | "incorrect" | "interpretive",
      interpretation_style?: string  // Exercises 1, 2 (interpretive)
    },
    exercise_2: { same structure },
    exercise_3: { same structure },   // Always objective
    exercise_4: {
      scenario_id: string,
      user_answer: string,
      behavioral_style: string        // "direct" | "strategic" | "accommodating" | "internalizing"
    }
  },
  interview: {
    intent: string,
    path: "A" | "B" | "C" | "D",
    context_selections: string[],
    situation_prompt_selected: string,
    free_responses: [
      { question: string, response: string },
      { question: string, response: string },
      { question: string, response: string },
      { question: string, response: string }
    ]
  },
  reaction: {
    rating: string,
    pushback_text: string | null
  }
}
```

---

## Screen-by-Screen Specification

### ACT 1: SETUP (Screens 1-7)

---

#### Screen 1: Thesis

**Layout:** Centered text, single button below.

**Copy:**

"Mirror sees the patterns in how you think, feel, and relate to people — including the ones you can't see on your own.

First, I'll see how you read other people. Then I'll learn how you see your own life. By the end, I'll show you something about yourself you probably haven't seen before."

**Button:** "Let's go"

**Data collected:** None.

**Next screen:** Screen 2.

---

#### Screen 2: Demographics Intro

**Layout:** Centered text, transitions automatically or with a subtle continue tap.

**Copy:** "First, some quick basics."

**Data collected:** None.

**Next screen:** Screen 3.

---

#### Screen 3: Name

**Layout:** Centered prompt, single text field, continue button.

**Copy:** "What should I call you?"

**Input:** Text field, first name only. No validation beyond non-empty.

**Data collected:** `user.name`

**Next screen:** Screen 4.

---

#### Screen 4: Age

**Layout:** Centered prompt, number input or scroll selector.

**Copy:** "How old are you, [name]?"

**Input:** Number. Reasonable range: 13-100.

**Data collected:** `user.age`

**Next screen:** Screen 5.

---

#### Screen 5: Gender

**Layout:** Centered prompt, four single-select buttons.

**Copy:** "What's your gender?"

**Options:**
- Male
- Female
- Non-binary
- Prefer not to say

**Data collected:** `user.gender`

**Next screen:** Screen 6.

---

#### Screen 6: Source

**Layout:** Centered prompt, four single-select buttons.

**Copy:** "How did you find Mirror?"

**Options:**
- A friend shared it with me
- I saw it on social media
- I saw someone's Mirror portrait
- Other

**Data collected:** `user.source`

**Next screen:** Screen 7.

---

#### Screen 7: Quick Read Introduction

**Layout:** Centered text with user's name, single button.

**Copy:** "Alright, [name]. Let's see how you read people."

**Button:** "Start"

**Data collected:** None.

**Next screen:** Screen 8.

---

### ACT 2: QUICK READ (Screens 8-11)

These screens present the four exercises. Content comes from `mirror-quick-read-exercises.md` and `app/lib/exercises.ts`. Exercises 1 and 2 are interpretive. Exercise 3 is objective. Exercise 4 is behavioral style.

No feedback or results are shown during this section. All answers are stored silently.

---

#### Screen 8: Exercise 1 — Behavioral Reading

**Layout:** Scenario text at top, four single-select option buttons below.

**Content:** The Exercise 1 scenario and options (interpretive — no correct answer).

**Scenario:** "You're at a small gathering. A friend who's usually talkative and warm greets everyone when they arrive but then spends most of the evening on the edge of conversations — laughing at the right moments, responding when spoken to, but not initiating anything. At one point you catch them staring out the window for a few seconds before someone pulls them back in."

**Options:**
- They're preoccupied with something unrelated to the gathering — work, a text they got, something on their mind
- They're feeling disconnected from this group lately and aren't sure they belong anymore
- They're tired or low-energy and doing their best to be present despite not being fully up for it
- They had a disagreement with someone at the gathering and they're managing the discomfort

**Data collected:** `quick_read.exercise_1`

**Next screen:** Screen 9.

---

#### Screen 9: Exercise 2 — Subtext Reading

**Layout:** Same as Screen 8.

**Content:** The Exercise 2 scenario and options (interpretive — no correct answer).

**Scenario:** "You've been dating someone for a few months. After a night out with your friends — which they didn't come to — they say: 'Sounds like you had a great time.'"

**Options:**
- They're genuinely glad you had fun — no subtext
- They feel left out and are flagging it indirectly
- They're testing whether you missed them or even noticed they weren't there
- They're fine but slightly jealous of the fun you had without them

**Data collected:** `quick_read.exercise_2`

**Next screen:** Screen 10.

---

#### Screen 10: Exercise 3 — Relational Dynamic

**Layout:** Text exchange displayed in a chat-bubble or message-thread visual style. Four single-select options below.

**Scenario:**
```
Person A: I've been thinking about what you said
Person B: Which part?
Person A: All of it honestly
Person B: Ok
Person A: I think you were right
Person B: I know. But thank you for saying that.
```

**Options:**
- Person A is apologizing and Person B is accepting gracefully
- Person B is asserting dominance — making Person A admit they were wrong
- Both are reconnecting, but Person B is still guarded
- Person A is trying to end the conflict and Person B isn't ready to move on

**Correct answer:** Both are reconnecting, but Person B is still guarded

**Data collected:** `quick_read.exercise_3`

**Next screen:** Screen 11.

---

#### Screen 11: Exercise 4 — Micro-Scenario

**Layout:** Same as Screen 8.

**Scenario:** "You're in a group meeting and share an idea. It gets a lukewarm response and the conversation moves on. A few minutes later, someone else brings up essentially the same idea in slightly different words and everyone responds enthusiastically. What's your first instinct?"

**Options:**
- Speak up and point out you said the same thing earlier
- Say nothing in the meeting but bring it up with the person privately later
- Let it go — what matters is that the idea is moving forward
- Say nothing and stew about it for the rest of the day

**Internal style mapping (not shown to user):**
- Option 1 → Direct
- Option 2 → Strategic
- Option 3 → Accommodating
- Option 4 → Internalizing

**Data collected:** `quick_read.exercise_4`

**Next screen:** Screen 12.

---

### ACT 3: INSIGHT INTERVIEW (Screens 12-19)

This is the branching section. Screen 12 is the same for everyone. Screens 13+ depend on the path selected.

**Progress bar:** Hidden during thesis, intent selection, insight chat, loading, quick read reveal (results), and reaction (insight card / accuracy check).

**Implementation (insight chat):** Paths A, B, and C use a single **Insight Chat** screen instead of separate guided-exploration screens. The chat presents the first question (from the situation prompt or path-specific fallback), then calls `/api/next-question` after each user response. The API returns the next question, an evidence score (0–1), and whether to continue or generate the insight. A bouncing-dot typing indicator shows while the next question is being generated. The conversation continues until (a) the planned turns are reached and evidence is sufficient, or (b) the API signals completion. Then the insight generation API is triggered. Planned turns per path: A/B: 4, C: 4 (including initial situation), D: 2 (not yet implemented).

---

#### Screen 12: Transition and Intent Selection

**Layout:** Two lines of text at top, then four single-select buttons.

**Copy:**

"Good. I'm getting a read on how you see other people. Now I want to learn how you see your own life.

What do you want Mirror to help you with?"

**Options:**
- "Help me understand what patterns are holding me back" → Path A
- "Help me navigate a relationship in my life" → Path B
- "Help me think through something I'm dealing with" → Path C

**Data collected:** `interview.intent`, `interview.path`

**Next screen:** Path-dependent (Screen 13a/b/c/d).

---

### PATH A: "Help me understand what patterns are holding me back"

#### Screen 13a: Context — Where

**Copy:** "Where do you feel the pattern most?"

**Options:**
- In my romantic relationships
- In my friendships or family
- At work or in my career
- In how I feel about myself generally
- Honestly, everywhere

If "everywhere" → show follow-up: "If you had to pick the area where it's most obvious, what would it be?" with the other four options. Route to the relevant set.

**Data collected:** `interview.context_selections[0]`

---

#### Screen 14a: Context — What

**Copy varies by Screen 13a selection.**

For romantic relationships — "What does the pattern feel like?"
- "I keep attracting or choosing the same kind of person"
- "Things start great and then fall apart the same way"
- "I hold back from fully committing or opening up"
- "I lose myself in relationships"
- "I'm not sure — I just know something keeps repeating"

For friendships or family:
- "I end up in the same role every time — the caretaker, the peacekeeper, the one who compromises"
- "I keep having the same kind of falling out"
- "I hold people at a distance without meaning to"
- "I give more than I get and then resent it"
- "I'm not sure — I just know something keeps repeating"

For work:
- "I keep hitting the same ceiling no matter what I try"
- "I don't speak up when I should and then regret it"
- "I take on too much and burn out"
- "I'm successful but it doesn't feel like enough"
- "I'm not sure — I just know something keeps repeating"

For about myself generally:
- "I know what I should do but I can't seem to do it"
- "I feel stuck but I can't pinpoint why"
- "I'm hard on myself in ways that don't make sense"
- "I avoid things that I know would be good for me"
- "I'm not sure — I just know something keeps repeating"

**Data collected:** `interview.context_selections[1]`

---

#### Screen 15a: Situation Proposal

**Copy:** "Choose one of these to answer."

**Three prompts generated based on the combination of Screen 13a and 14a selections.** These should be pre-written for each combination. Example for romantic relationships + things start great then fall apart:

- "Think about the moment in your last relationship where you first knew something had shifted."
- "Think about what your last two partners would say went wrong — and whether they'd say similar things."
- "Think about what you do when a relationship starts going really well. What changes inside you?"

**Data collected:** `interview.situation_prompt_selected`

---

#### Screen 16a: Insight Chat (Paths A, B, C)

**Layout:** Chat interface. Messages appear as bubbles (Mirror left-aligned, user right-aligned). Large text input at bottom with Send button. Optional dictation (Speak) button.

**First question (example for "the moment you first knew something had shifted"):** "Tell me about that moment. What happened, and what changed inside you? The more detail you share, the more I can see."

**Input:** Free text. Placeholder: "e.g., We were at dinner and I noticed they got quiet after I mentioned something about the future..."

**Minimum character nudge:** If under 50 characters, show: "Can you tell me a bit more? The more detail you share, the more I can see."

**Follow-ups:** Generated by `/api/next-question` after each response. Path A fallback questions (when API hasn't provided a dynamic question) include: "When you noticed that shift — what did you actually do?", "Has that exact sequence happened before?", "When you imagine someone who really knows you hearing this story — what part would they say you're leaving out?"

**Loading state:** Bouncing-dot typing indicator in a chat bubble while the next question is being generated.

**Data collected:** `interview.free_responses` (array of { question, response })

**Next screen:** Screen 20 (loading) when conversation completes.

---

### PATH B: "Help me navigate a relationship in my life"

#### Screen 13b: Context — Who

**Copy:** "Who's on your mind?"

**Options:**
- My partner or someone I'm dating
- A close friend
- A family member
- Someone at work
- Someone I've lost or am losing

**Data collected:** `interview.context_selections[0]`

---

#### Screen 14b: Context — What

**Copy varies by Screen 13b selection.**

For partner:
- "There's tension that neither of us is addressing"
- "We had a conflict and I'm not sure how to repair it"
- "I feel like they don't understand something important about me"
- "The dynamic has shifted and I don't know why"
- "I need to have a hard conversation and I'm avoiding it"

For close friend:
- "Something shifted between us and I can't pinpoint it"
- "I feel like I'm always the one making the effort"
- "There's something I need to say but I'm afraid it'll change things"
- "We keep having the same misunderstanding"
- "I'm questioning whether this friendship is still working"

For family member:
- "There's an old dynamic that keeps playing out"
- "Something happened and we're not past it"
- "I feel like I become a different person around them"
- "I want to be closer but something is in the way"
- "I need to set a boundary and I don't know how"

For someone at work:
- "There's tension that's affecting my work"
- "I feel like they have the wrong read on me"
- "I need to address something and I'm dreading it"
- "They're difficult and I don't know how to handle them"
- "The power dynamic makes it hard to be honest"

For someone I've lost or am losing:
- "I'm trying to make sense of why it ended"
- "I'm holding onto something and I'm not sure I should be"
- "There's something I never said"
- "I'm not sure if I should try to repair it or let it go"

**Data collected:** `interview.context_selections[1]`

---

#### Screen 15b: Situation Proposal

**Copy:** "Choose one of these to answer."

Three prompts based on selections. Example for partner + tension neither is addressing:

- "Describe a recent moment where you both felt the tension but neither of you named it."
- "What's the thing you most want to say to them but haven't?"
- "If they were here right now and I asked them what's wrong, what do you think they'd say?"

**Data collected:** `interview.situation_prompt_selected`

---

#### Screen 16b: Insight Chat (Path B)

Same chat interface as Screen 16a. **First question (example for "a moment where you both felt it but neither named it"):** "Set the scene for me. Where were you, what was happening on the surface, and what was happening underneath? The more detail you share, the more I can see."

Path B fallback questions: "What do you think they were feeling in that moment?", "Now — what were you feeling?", "If you had said something in that moment — what do you think would have happened?"

**Next screen:** Screen 20 (shared).

---

### PATH C: "Help me think through something I'm dealing with"

#### Screen 13c: Context — What Kind

**Copy:** "What's going on?"

**Options:**
- A decision I need to make
- A conflict or confrontation
- Something that happened that I'm still processing
- Something coming up that I'm anxious about

**Data collected:** `interview.context_selections[0]`

---

#### Screen 14c: Context — Details

**Copy varies by Screen 13c selection.**

For a conflict:
"Who's it with?"
- My partner or someone I'm dating
- A friend or family member
- Someone at work
- Honestly, it's more with myself

For a decision:
"What makes the decision hard?"
- "I know what I should do but I can't bring myself to do it"
- "I genuinely don't know what I want"
- "Other people are affected and I'm worried about that"
- "I keep going back and forth and I can't commit"

For something coming up:
"What's making it hard?"
- "I don't know how the other person will react"
- "I don't know what I actually want to say"
- "I'm worried I'll handle it badly"
- "I keep avoiding it and I don't fully understand why"

For still processing:
"What won't let go of you?"
- "Something someone said or did"
- "How I handled a situation"
- "A feeling I can't shake and can't explain"
- "A realization about myself I'm not sure what to do with"

**Data collected:** `interview.context_selections[1]`

---

#### Screen 15c: Situation Prompt

**Copy:** "Tell me what's happening — the situation and the hard part — in whatever way feels natural. The more detail you share, the more I can see."

**Input:** Free text. This path skips the three-option proposal because the user already has a specific situation.

**Data collected:** `interview.free_responses[0]`

---

#### Screen 16c: Insight Chat (Path C)

Same chat interface. Path C's initial situation (Screen 15c) is the first free response. **First follow-up question:** "What's the outcome you're most afraid of here? Not the practical worst case — the emotional worst case."

Path C fallback questions: "And what would you normally do in a situation like this?", "What's the gap between those two things — what you'd default to and what you wish you'd do instead?"

**Next screen:** Screen 20 (shared).

---

### PATH D: "I just want to see how well this reads me"

#### Screen 13d: Mirror Takes the Lead (Lead-in)

**Layout:** Text from Mirror, then continue.

**Copy:** "Interesting. Your quick read already told me something. Let me test a theory."

**Next screen:** Screen 13d-2.

---

#### Screen 13d-2: Targeted Question

**Layout:** Single targeted multiple-choice question. The question is selected based on the most notable signal from the quick read data.

**Question selection logic:**

If the user chose the avoidant/internalizing option in Exercise 4:
"When something is bothering you, how long does it usually take before you tell someone?"
- Less than a day
- A few days
- A week or more
- I usually don't — it passes or I figure it out myself

If the user chose the direct option in Exercise 4:
"When you disagree with someone you care about, what matters more to you — being honest or keeping the peace?"
- Being honest, even if it causes friction
- It depends on the person and the stakes
- Keeping the peace, unless it's something I really can't let go
- I usually find a way to be honest without causing friction

If the user chose the strategic option in Exercise 4:
"How often do the people closest to you know what you're actually thinking?"
- Almost always — I'm pretty open
- Most of the time, unless it's something sensitive
- Less often than they'd think
- Rarely — I share when I'm ready, not when they ask

If the user chose the accommodating option in Exercise 4:
"When someone asks you what you want — for dinner, for the weekend, for your life — how easy is it to answer?"
- Easy — I usually know what I want
- Depends on the stakes — small things are easy, big things are hard
- Harder than it should be — I tend to defer to what others want
- I know what I want but I don't always say it

**Data collected:** `interview.context_selections[0]`

---

#### Screen 14d: Deeper Probe — Question 1

**Free response, targeted to their answer from Screen 13d.**

This question should push past the surface of their selection. Since the question varies based on Exercise 4 response AND Screen 13d selection, there are multiple variants.

Example for avoidant Exercise 4 + "I usually don't tell someone":

**Copy:** "Why not? Be honest — is it because it genuinely passes, or because saying it out loud feels like more of a risk than keeping it in?"

Example for direct Exercise 4 + "being honest even if it causes friction":

**Copy:** "Has your honesty ever cost you a relationship — or come close? Tell me about a time it backfired."

Example for accommodating Exercise 4 + "I tend to defer to what others want":

**Copy:** "When did that start? Was there a specific relationship or moment where you learned that what you wanted mattered less than keeping things smooth?"

**Data collected:** `interview.free_responses[0]`

---

#### Screen 15d: Deeper Probe — Question 2

**One more targeted free-response question based on their previous answer.**

Example for the person who doesn't tell people what's bothering them:

**Copy:** "When you imagine actually telling someone what's bothering you — fully, without filtering — what's the worst thing you imagine happening?"

Example for the honest-even-if-it-costs person:

**Copy:** "Is there anyone in your life right now that you're not being fully honest with? What's stopping you with that specific person?"

Example for the person who defers:

**Copy:** "What happens when someone actually asks what you want and waits for a real answer? What do you feel in that moment?"

**Data collected:** `interview.free_responses[1]`

**Next screen:** Screen 20 (shared).


---

### ACT 4: GENERATE RESULTS + REVEAL (Screens 20-22)

These screens are shared across all paths.

---

#### Screen 20: Loading / Processing

**Layout:** Centered text with a subtle animation. This screen shows while the API generates the results.

**Copy:** "Give me a moment. I'm putting something together for you."

**API call triggered:** After the user submits the final guided exploration response for their path, fire the insight generation API call. Send the complete data model (quick read selections + interview data) to the LLM using the system prompt and insight generation template.

**Duration:** However long the API call takes (typically 5–20 seconds depending on model/network).

**Next screen:** Screen 21 (when API response is received).

---

#### Screen 21: Quick Read (Synthesis)

**Layout:** A single scrollable card that leads with a cohesive synthesis paragraph, followed by a short “What I based this on” section. A share button at the bottom.

**Copy header:** "First — here's how you read people."

**Content:** Generated by the API (from the `quick_read` field).
- Lead with the perception profile synthesis (woven narrative across the four exercises; fair, calibrated tone; no absolutist claims).
- Below, show the four per-exercise signals as supporting evidence.

**Tone note:** Avoid “you missed X entirely / always / never” language. This is a first-pass read that gets sharper with more context, while still being specific.

**Share functionality:** The perception profile summary should be renderable as a visual card (image) that can be shared via standard OS share sheet.

**Button:** "Continue"

**Next screen:** Screen 22.

---

#### Screen 22: Accuracy Check (Iterative)

**Layout:** Keep the full insight report visible on the same screen. Then ask for an accuracy rating and feedback.

**Copy:** "How accurate does this feel?"

**Input 1:** 1–10 scale.

**Input 2:** Feedback text area (supports dictation): “What felt right? What felt off?”

Include this copy:
"This is our first conversation, so it may not be perfect yet. Thankfully, Mirror gets sharper the more you use it and grows with you."

**Behavior:** User can send feedback multiple times. Each send triggers a refinement call and updates the report in-place until the user is satisfied.

**Next screen:** End of onboarding MVP (no mirror display / first action screens).

---

#### (Removed) Screen 25–26

The Mirror visualization + first action screens are removed for this MVP iteration. The focus is validating the initial report’s accuracy via the iterative accuracy check.

---

## API Call Specifications

### Call 1: Next Question Generation (fired after each insight chat response)

**Endpoint:** POST to `/api/next-question`

**Request body:** `path`, `stepIndex`, `contextSelections`, `situationPromptSelected`, `lastQuestion`, `lastResponse`, `priorFreeResponses`, `threshold` (0.62), `maxTurns`, `currentTurn`, `isLastPlannedTurn`

**Behavior:** Returns `{ nextQuestion, evidenceScore, shouldContinue }`. If not at last planned turn and `nextQuestion` is non-empty, show it and continue the chat. If at last turn and `shouldContinue` is true (evidence below threshold, room to extend), add one more turn. Otherwise, trigger insight generation. The chat uses template-based acknowledgments (e.g., "That's a clear moment.") when the user submits; the next-question API generates the follow-up question directly.

### Call 2: Insight Generation (fired after insight chat completes)

**Endpoint:** POST to `/api/generate-insight` (calls Anthropic Messages API)

**System message:** Contents of `mirror-system-prompt.md`

**User message:** The insight generation template from `mirror-insight-prompt-template.md`, populated with all collected data from the onboarding session.

**Parameters:**
- Model: Most capable available (e.g., claude-sonnet-4-20250514)
- Max tokens: 2000
- Temperature: 0.7

**Expected response:** JSON with `quick_read` breakdown, `insight` text, `fragments_touched`, `patterns_detected`, `hypotheses_to_explore`

**Error handling:** If the API call fails, show a retry state: "Something went wrong. Let me try again." with a retry button. If it fails twice, show: "I'm having trouble right now. Try again in a moment."

### Call 3: Report Refinement (fired on Screen 22 feedback)

**System message:** Same system prompt.

**User message:** Provide the current report, their 1–10 score, their feedback, and any prior refinement turns. Ask the model to (1) respond as Mirror and (2) return a revised report.

**Parameters:**
- Model: Same as Call 1
- Max tokens: 500
- Temperature: 0.7

**Expected response:** JSON: `{ "message": "...", "revisedInsight": "..." }`

---


## Situation Prompt Library

The situation proposals on Screen 15a/b need pre-written prompts for each combination of context selections. Below are the combinations that need prompts written. Each combination needs three prompt options.

### Path A Combinations (Context Where × Context What)

- Romantic relationships × each of 5 "what" options = 5 sets of 3 prompts
- Friendships/family × each of 5 "what" options = 5 sets
- Work × each of 5 "what" options = 5 sets
- About myself × each of 5 "what" options = 5 sets

**Total: 20 sets of 3 prompts = 60 prompts for Path A**

### Path B Combinations (Context Who × Context What)

- Partner × each of 5 "what" options = 5 sets of 3 prompts
- Close friend × each of 5 "what" options = 5 sets
- Family member × each of 5 "what" options = 5 sets
- Someone at work × each of 5 "what" options = 5 sets
- Someone lost/losing × each of 4 "what" options = 4 sets

**Total: 24 sets of 3 prompts = 72 prompts for Path B**

### Path C

Path C skips the proposal screen — the user describes their situation directly.

**For MVP:** You don't need all 132 prompts on day one. Start with the 3-5 most common combinations per path (likely romantic relationships and partner dynamics). Write those prompts. For less common combinations, use a fallback set of generic-but-good prompts that work across contexts. Expand the library as you test and learn which paths users actually take.
