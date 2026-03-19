# Mirror — Insight Generation Prompt Template

This template is used after the user completes onboarding. It passes all collected data to the AI along with the system prompt and asks for two outputs: the quick read breakdown and the integrated insight.

---

## Prompt Structure

The API call should include:
1. The system prompt (mirror-system-prompt.md) as the system message
2. The user message below, populated with the actual onboarding data

---

## User Message Template

```
Here is the onboarding data for a new Mirror user. Generate their combined reveal.

## User Info
- Name: {user_name}
- Age: {user_age}
- Gender: {user_gender}
- Source: {how_they_found_mirror}

## Quick Read Results

Exercise 1 — Facial Perception:
- Shown: {description_of_face_image}
- Correct answer: {correct_emotion}
- User's answer: {user_answer_1}
- Result: {correct/incorrect}

Exercise 2 — Vocal Tone:
- Clip: {description_of_audio_clip}
- What was actually happening: {correct_interpretation}
- User's answer: {user_answer_2}
- Result: {correct/incorrect}

Exercise 3 — Text Interpretation:
- Exchange shown: {the_text_exchange}
- What was actually going on: {correct_dynamic}
- User's answer: {user_answer_3}
- Result: {correct/incorrect}

Exercise 4 — Micro-Scenario:
- Scenario: {scenario_text}
- User's answer: {user_answer_4}
- (No correct/incorrect — this reveals behavioral style)

## Interview Path
Path selected: {A: patterns / B: relationship / C: situation / D: read me}

## Interview Selections
- Intent: "{exact_text_of_intent_selection}"
- Context question 1: "{exact_text_of_selection}"
- Context question 2: "{exact_text_of_selection}"
- Situation prompt selected: "{exact_text_of_prompt_they_chose}"

## Interview Free Responses

Question 1: "{exact_question_asked}"
Response: "{user_free_response_1}"

Question 2: "{exact_question_asked}"
Response: "{user_free_response_2}"

Question 3: "{exact_question_asked}"
Response: "{user_free_response_3}"

Question 4: "{exact_question_asked}" (if applicable — Path C has fewer questions)
Response: "{user_free_response_4}"

---

## Your Task

Generate two outputs.

### Output 1: Quick Read Breakdown

For each of the four exercises, write a one to two sentence narrative breakdown of what the user got right or wrong and what it reveals. Use second person — speak directly to the user.

For exercises 1-3, explain what the correct answer was and what it means that they caught it or missed it. Be specific about what the emotion was and why it's commonly misread.

For exercise 4, there is no right or wrong. Instead, interpret what their choice reveals about their instinctive behavioral style under social pressure.

After the four individual breakdowns, write a two to three sentence perception profile summary. Identify their strongest and weakest channels, and state the practical implication — how this shapes their daily experience of reading people.

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

The insight should be 150-250 words of fluid prose. No bullet points, no headers, no structured formatting. Just Mirror speaking directly to this person.

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

The JSON fields beyond "quick_read" and "insight" are for internal use — they seed the user's profile and inform what Mirror explores next. The user only sees the quick_read and insight content.
```

---

## Implementation Notes

### API Call Configuration
- Model: Use the most capable available model (e.g., claude-sonnet-4-20250514 or equivalent)
- Max tokens: 2000 (the outputs should be concise — if the model is generating more, the insight is probably too verbose)
- Temperature: 0.7 (enough creativity to produce vivid language, not so much that it hallucinates patterns)
- The system prompt should be passed as the system message, not embedded in the user message

### Quick Read Exercise Content
You need to create a library of quick read exercises with validated correct answers. For the MVP test:

**Facial Perception:** Source 4-6 photographs of faces displaying nuanced emotions. These should NOT be exaggerated or obvious expressions. Ideal: mixed or masked emotions (hurt masked as composure, anxiety masked as cheerfulness, contempt that looks like boredom). For each, have 2-3 experts validate the correct primary emotion. Use the same set for all test users initially — you can randomize later.

**Vocal Tone:** Record or source 4-6 audio clips of people saying neutral sentences with emotional subtext. "No, it's fine" said with different underlying emotions. "I'll be there" said with reluctance versus genuine enthusiasm. Have these validated by multiple listeners.

**Text Interpretation:** Write 4-6 short text exchanges (3-5 messages each) with ambiguous emotional dynamics. Each should have a defensible "best" interpretation and 2-3 plausible but less accurate alternatives. Test these with a pilot group to ensure the correct answer is actually consensus.

**Micro-Scenarios:** Write 4-6 workplace/social scenarios with 4 response options each. These don't have correct answers — they map to behavioral styles:
- Option A = confrontational/direct
- Option B = diplomatic/strategic
- Option C = accommodating/self-sacrificing
- Option D = avoidant/internalizing

Label these internally but never show the labels to the user.

### Handling Thin Responses
Some users will give very brief free-text responses. The system prompt instructs Mirror to work with what it has, but if responses are extremely thin (under 10 words per answer), the insight quality will suffer.

Mitigation options:
1. In the frontend, use placeholder text in the free-response fields that models the expected depth: "e.g., We were at dinner and I noticed they got quiet after I mentioned work. I didn't say anything but I could feel the whole mood shift..."
2. If the AI determines it doesn't have enough data to produce a specific, non-generic insight, have it output a flag in the JSON: "insufficient_data": true. The frontend should then route the user into an additional question or two before generating the insight.
3. Set a minimum character count on free-response fields (e.g., 50 characters) to encourage more than one-word answers.

### Handling "Does this feel right?" Pushback
If the user selects "Partially" or "No" on the reaction screen, you should make a follow-up API call:

```
The user was shown this insight:

"{the_generated_insight}"

They responded: "{Partially / No}" and said: "{their_free_text_pushback}"

Respond as Mirror. Engage with their pushback in 2-3 sentences. Be genuinely curious about what doesn't fit. If their pushback reveals something more accurate than your original observation, acknowledge it and refine. If their pushback seems like resistance to an uncomfortable truth, gently note that without being aggressive. End with one sentence that bridges toward continuing to explore in the full product.
```

This follow-up uses the same system prompt. The response should be displayed conversationally, not as a new insight card.
