# Mirror — Insight Quality Testing Framework

## Overview

The purpose of testing is to answer one question: does Mirror produce insights that make people feel genuinely seen?

Everything else — retention, virality, business model — depends on this. If the insights land, the product works. If they don't, nothing else matters.

## Phase 1: Prompt Testing (Week 1)

Before putting the onboarding in front of real users, test the system prompt and insight generation with simulated inputs.

### How to Run Prompt Tests

1. Open the API playground or a simple script that calls the API
2. Paste the system prompt as the system message
3. Create a user message using the insight generation template, populated with simulated onboarding data
4. Generate the insight
5. Evaluate against the criteria below

### Create 10-15 Simulated User Profiles

Each profile should include realistic quick read answers and free-text responses. Vary across these dimensions:

**Verbosity:** Some users write paragraphs. Some write one sentence. Test both extremes.
- Verbose example: "It was this moment at dinner where I could literally feel the air change. He had been talking about his day and I made a comment about how he never asks about mine and he just went quiet. Not angry quiet — this very specific kind of quiet where I know he's decided the conversation isn't worth having. And I just sat there eating and pretending everything was fine because honestly what else do you do when someone decides you're not worth the argument?"
- Terse example: "We were at dinner and I said something about him not asking about my day and he shut down."

**Self-awareness:** Some users are highly introspective. Some can barely name an emotion.
- High awareness: "I think I was feeling a mix of hurt and resentment, but honestly underneath that there was this fear that I was being too needy."
- Low awareness: "I was just frustrated I guess. Or annoyed. I don't know."

**Path diversity:** Test all four paths (patterns, relationships, situations, read me).

**Quick read variation:** Test profiles that score high across all exercises, low across all, mixed (high face/low voice), etc.

**Demographic variation:** Different ages, genders, life contexts.

### Evaluation Criteria for Each Generated Insight

Rate each insight on these dimensions (1-5 scale):

**Specificity (1-5):** Does the insight reference specific words the user used? Could this insight only apply to this person, or is it generic enough to apply to anyone?
- 1 = Could be a horoscope. "You care deeply about people but sometimes forget to care for yourself."
- 3 = References the person's situation but the observation is somewhat common. "You tend to prioritize others' feelings over your own."
- 5 = References exact phrases, identifies a specific contradiction in this person's data, couldn't apply to someone else.

**Quick Read Integration (1-5):** Does the insight meaningfully connect the perception data to the interview data? Or does it just mention the quick read in passing?
- 1 = Quick read data is ignored or mentioned in one throwaway sentence.
- 3 = Quick read results are stated and then the interview insight follows separately — connected but not synthesized.
- 5 = The quick read data and interview data are woven into a single observation where neither alone would produce the insight.

**Pattern Identification (1-5):** Does the insight identify a pattern in HOW the person told their story, not just WHAT they told? Does it see something the person likely doesn't see themselves?
- 1 = Just summarizes what they said. "You had a fight with your partner and you felt bad about it."
- 3 = Identifies a general tendency. "You seem to focus on what other people are feeling."
- 5 = Identifies a specific, surprising pattern with evidence. "You described three emotional situations and in every one, you narrated from the other person's perspective before your own — and each time, the transition to your own feelings was preceded by 'I don't know' as if you needed permission to have them."

**Voice (1-5):** Does it sound like Mirror? Direct, specific, slightly provocative? Or does it sound like a therapist, a chatbot, or a self-help book?
- 1 = "It sounds like you might have a tendency to..." — therapeutic hedge language.
- 3 = Direct but not distinctive. Could be any smart AI assistant.
- 5 = Sharp, vivid, specific. Uses concrete metaphors. Feels like a person who sees you clearly is talking to you.

**Edge Quality (1-5):** Does the insight end with something that creates pull — a question or observation that makes the person want to explore further? Or does it just conclude?
- 1 = Ends with a generic statement. "There's more to explore here."
- 3 = Ends with a relevant question that's somewhat obvious. "What would happen if you spoke up?"
- 5 = Ends with a reframe or question that shifts how the person sees the entire pattern. Makes them want to immediately respond.

**Overall Impact (1-5):** If a real person with this profile read this insight, would they stop and stare? Would they want to screenshot it?
- 1 = They'd think "that's kind of true I guess" and move on.
- 3 = They'd think "huh, that's an interesting observation" and pause.
- 5 = They'd think "how did it know that" and immediately want to show someone.

### Minimum Threshold for Proceeding to Phase 2

Average scores across all simulated profiles should be:
- Specificity: 4+
- Quick Read Integration: 3.5+
- Pattern Identification: 4+
- Voice: 4+
- Edge Quality: 3.5+
- Overall Impact: 4+

If scores are below threshold, iterate on the system prompt before testing with real users. Common fixes:
- Low specificity → Add more emphasis on referencing exact user language in the system prompt
- Low quick read integration → Add more examples of how to synthesize perception data with interview data
- Low pattern identification → Add more guidance on looking at HOW stories are told, not just WHAT is told
- Low voice → Add more voice examples (good and bad) to the system prompt
- Low edge quality → Add more examples of strong closing questions/observations

## Phase 2: Real User Testing (Week 2-3)

### Recruitment

Find 10-15 people willing to go through the onboarding. Aim for diversity in:
- Age (early 20s through 40s minimum)
- Gender
- Relationship status and context
- Self-awareness level (some who are introspective, some who aren't)
- Verbosity (some talkers, some terse communicators)

Don't recruit only friends — you need people who will be honest about whether the insight landed, not people who will be polite.

### Test Protocol

For each user:

1. Have them go through the onboarding flow on whatever platform you've built it on.
2. After they see the combined reveal (quick read breakdown + insight), ask them to rate the following on a 1-10 scale:

**Accuracy:** "How accurately does this describe you?" (1 = completely wrong, 10 = eerily accurate)

**Novelty:** "Did this tell you something you didn't already know about yourself?" (1 = nothing new, 10 = I never thought of it that way)

**Specificity:** "Does this feel specific to you, or could it apply to anyone?" (1 = could be anyone, 10 = this is definitely about me)

**Share impulse:** "How likely would you be to screenshot this and send it to someone?" (1 = not at all, 10 = I want to send it right now)

**Continue impulse:** "How curious are you about what else Mirror would find with more conversations?" (1 = not interested, 10 = I want to keep going immediately)

3. After the ratings, ask three open-ended questions:
- "What part of the insight hit hardest? What part felt most true?"
- "Was there anything that felt off or wrong?"
- "If you were going to send this to someone, what would you say about it?"

4. Observe their physical reaction when they first read the insight. Note:
- Did their expression change?
- Did they pause or read it more than once?
- Did they spontaneously say anything?
- Did they immediately want to show someone?

### What You're Looking For

**Strong signals that the product works:**
- Accuracy ratings consistently 7+
- Novelty ratings consistently 6+
- Share impulse ratings consistently 6+
- Users re-reading the insight or saying "that's... actually really accurate"
- Users spontaneously wanting to discuss the insight further
- Users asking "how did it know that?"
- Users immediately showing it to someone nearby

**Warning signals that need addressing:**
- Accuracy ratings below 5 for more than 2 users → The system prompt needs better pattern recognition guidance
- Novelty ratings below 4 consistently → The insights are too surface-level, the prompt needs to push for deeper/less obvious observations
- Specificity ratings below 5 → The insights are too generic, the prompt needs more emphasis on referencing exact user language
- Share impulse below 4 consistently → The insights might be accurate but not vivid enough to share — voice needs work
- Users saying "that could apply to anyone" → Fatal signal. The insight generation needs fundamental revision.
- Users being confused by the quick read connection → The synthesis isn't working. Quick read data needs to be more naturally woven in.

### Minimum Threshold for Proceeding

At least 10 out of 15 users should rate accuracy 7+ and novelty 6+. At least 8 out of 15 should rate share impulse 6+. If these thresholds aren't met, iterate on the system prompt and retest before building further.

## Phase 3: Quick Read Content Validation (Parallel)

Run the quick read exercises with 20-30 people (can overlap with Phase 2 users) to validate:

1. **Correct answers are actually correct.** Do at least 60% of a pilot group agree on the "right" answer for exercises 1-3? If not, the exercise is too ambiguous and needs to be replaced.

2. **Difficulty is appropriate.** Exercises shouldn't be too easy (everyone gets them right — no signal generated) or too hard (everyone gets them wrong — feels unfair and discouraging). Aim for 40-70% accuracy rate on each exercise.

3. **Micro-scenario options are balanced.** No single option in exercise 4 should be selected by more than 50% of users. If one option dominates, the scenario isn't discriminating between behavioral styles and needs revision.

4. **The exercises feel engaging.** Ask users after: "Did the quick read exercises feel interesting or tedious?" If more than a third say tedious, the content needs to be more compelling.

## Iteration Cycle

After each round of testing:

1. Collect all generated insights and user ratings
2. Identify the 3 highest-rated and 3 lowest-rated insights
3. Compare them — what did the high-rated insights do that the low-rated ones didn't?
4. Adjust the system prompt accordingly
5. Retest with new users (don't reuse the same people — they've already been primed)

Expect 2-3 iteration cycles before the insight quality is consistently strong. This is normal. The system prompt is the product at this stage, and getting it right requires empirical refinement, not just writing skill.
