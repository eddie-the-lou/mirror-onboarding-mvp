Here is the onboarding data for a new Mirror user. Generate their combined reveal.

## User Info
- Name: {user_name}
- Age: {user_age}
- Gender: {user_gender}
- Source: {how_they_found_mirror}

## Quick Read Results

Exercise 1:
- Scenario: {exercise_1_scenario}
- User's answer: {user_answer_1}

Exercise 2:
- Scenario: {exercise_2_scenario}
- User's answer: {user_answer_2}

Exercise 3 — Text Interpretation:
- Exchange shown: {exercise_3_scenario}
- User's answer: {user_answer_3}

Exercise 4 — Micro-Scenario:
- Scenario: {exercise_4_scenario}
- User's answer: {user_answer_4}
- (No correct/incorrect — this reveals behavioral style)

## Interview Path
Path selected: {A: patterns / B: relationship / C: situation / D: read me}

## Interview Selections
- Intent: "{exact_text_of_intent_selection}"
- Context question 1: "{context_selection_1}"
- Context question 2: "{context_selection_2}"
- Situation prompt selected: "{exact_text_of_prompt_they_chose}"

## Interview Free Responses

Question 1: "{question_1}"
Response: "{user_free_response_1}"

Question 2: "{question_2}"
Response: "{user_free_response_2}"

Question 3: "{question_3}"
Response: "{user_free_response_3}"

Question 4: "{question_4}" (if applicable — Path C has fewer questions)
Response: "{user_free_response_4}"

---

## Your Task

Generate two outputs.

### Output 1: Quick Read Breakdown

For each of the four exercises, write a single tight sentence (max ~25 words) about what their choice reveals about how they read people or respond under pressure. Use second person — speak directly to the user.

Important framing rules:
- Do not use "right/wrong", "correct/incorrect", or "you were wrong/right". Instead, frame it as "what your choice emphasizes" and "what this suggests about your perception or coping style."
- Never expose internal IDs, slugs, or backend labels. The user should only ever see natural language.
- Each exercise breakdown MUST restate the user's selection using the label text (e.g., “You read it as: {user_answer_1}”) before making the interpretation. This way the user doesn't need to remember the original question.
- Avoid overly deterministic or totalizing language. Do NOT use absolutes like "entirely", "always", "never", "you missed X", "you ignored X". Use calibrated language like "you tended to", "you leaned toward", "you might be prioritizing", "this points to".
- Keep the tone fair: treat this as a first-pass read that gets sharper with more context, while still being specific and interesting.

For exercises 1–3, be specific about what their interpretation focused on and what that suggests about their perception style or blind spots.

For exercise 4, there is no right or wrong. Instead, interpret what their choice reveals about their instinctive behavioral style under social pressure.

After the four individual breakdowns, write a cohesive perception profile summary as 3–5 sentences (max ~110 words). This should be the most engaging part.

The first sentence MUST explicitly anchor to their Exercise 1-4 selections (name at least 2 of the four selections in plain text, like "You chose '{user_answer_1}' and '{user_answer_3}'...").
Then weave the exercises together into one through-line: name a strength, name a bias, and end with a curiosity-hook (one sharp question) — without sounding harsh or certain.

Format this section as:

[Exercise 1 breakdown]

[Exercise 2 breakdown]

[Exercise 3 breakdown]

[Exercise 4 breakdown]

[Perception profile summary]

### Output 2: The Integrated Insight

Generate the Mirror insight following the structure and rules in your system prompt. This MUST:

1. Open by addressing the user by name and referencing their quick read results
2. Connect the quick read data to patterns from the interview — find the contradiction, the gap, or the cost
3. Reference specific words and phrases the user used in their free responses
4. Identify a pattern in HOW they told their story, not just WHAT they told
5. End with an edge — a question or observation that points deeper

The insight should be 120–180 words of fluid prose. No bullet points, no headers, no structured formatting. Just Mirror speaking directly to this person.

---

## Output Format

Return your response in the following JSON structure:

{
  "quick_read": {
    "exercise_1": "Narrative breakdown of exercise 1...",
    "exercise_2": "Narrative breakdown of exercise 2...",
    "exercise_3": "Narrative breakdown of exercise 3...",
    "exercise_4": "Narrative breakdown of exercise 4...",
    "perception_profile": "Overall perception summary..."
  },
  "insight": "The full integrated insight text...",
  "fragments_touched": {
    "primary": "The fragment this insight most strongly feeds (inner_world / reading_people / under_pressure / showing_up)",
    "secondary": ["Other fragments that received signal from this onboarding"]
  },
  "patterns_detected": [
    "Brief description of pattern 1 detected",
    "Brief description of pattern 2 detected"
  ],
  "hypotheses_to_explore": [
    "Questions or threads for future conversations to investigate"
  ]
}

