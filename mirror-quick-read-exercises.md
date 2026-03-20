# Mirror — Quick Read Exercises

Four text-based exercises that reveal how the user perceives and interprets the world. Exercises 1 and 2 are interpretive — no correct answers, each choice reveals an interpretation pattern. Exercise 3 tests perception accuracy (defensible correct answer). Exercise 4 reveals behavioral style.

**Exercise 1 — Behavioral Reading (Interpretive).** When you see ambiguous behavior, where does your mind go? Your interpretation reveals your default attribution style.

**Exercise 2 — Subtext Reading (Interpretive).** When someone says something with potential subtext, what do you hear? Your interpretation reveals your default listening orientation.

**Exercise 3 — Relational Dynamic (Objective).** Can you accurately read the dynamic between two people based on structural evidence in a text exchange?

**Exercise 4 — Micro-Scenario (Behavioral Style).** When you're under social or emotional pressure, what's your instinctive response? No correct answer — each option maps to a behavioral style.

---

# EXERCISES (Implementation in `app/lib/exercises.ts`)

---

## Exercise 1: Behavioral Reading (Interpretive)

**What it tests:** When you see ambiguous behavior, where does your mind go? Your interpretation reveals your default attribution style.

### The Scenario

"You're at a small gathering. A friend who's usually talkative and warm greets everyone when they arrive but then spends most of the evening on the edge of conversations — laughing at the right moments, responding when spoken to, but not initiating anything. At one point you catch them staring out the window for a few seconds before someone pulls them back in."

**What do you think is going on?**

- They're preoccupied with something unrelated to the gathering — work, a text they got, something on their mind
- They're feeling disconnected from this group lately and aren't sure they belong anymore
- They're tired or low-energy and doing their best to be present despite not being fully up for it
- They had a disagreement with someone at the gathering and they're managing the discomfort

**What each choice reveals (internal — not shown to user):**

- "Preoccupied with something external" → External-cause attribution. They read behavior as the product of outside circumstances. Observational, distanced read.
- "Feeling disconnected from the group" → Belonging-oriented read. Sensitive to social positioning and exclusion. Often correlates with the user's own experiences of belonging.
- "Tired and doing their best" → Generous/normalizing interpretation. Either genuine empathy or a pattern of minimizing signals.
- "Disagreement with someone here" → Interpersonal-tension read. Assumes the cause is someone specific in the environment. Sensitive to conflict undercurrents.

---

## Exercise 2: Subtext Reading (Interpretive)

**What it tests:** When someone says something with potential subtext, what do you hear? Your interpretation reveals your default listening orientation.

### The Scenario

"You've been dating someone for a few months. After a night out with your friends — which they didn't come to — they say: 'Sounds like you had a great time.'"

**What are they really saying?**

- They're genuinely glad you had fun — no subtext
- They feel left out and are flagging it indirectly
- They're testing whether you missed them or even noticed they weren't there
- They're fine but slightly jealous of the fun you had without them

**What each choice reveals (internal — not shown to user):**

- "Genuinely glad" → Trusts surface communication. Either doesn't read subtext naturally or actively chooses not to assume hidden meaning.
- "Feel left out" → Reads hurt underneath the statement. Hears a bid for inclusion disguised as a comment.
- "Testing" → Reads strategy and evaluation. Hears the statement as a probe gathering data about their importance.
- "Fine but slightly jealous" → Reads a mixed emotional state. Hears something nuanced — not hurt, not strategic, just a minor uncomfortable feeling expressed lightly.

---

# SHARED EXERCISES (Objective & Behavioral)

---

## Exercise 3: Relational Dynamic (Objective)

**What it tests:** Can you accurately read the dynamic between two people based on structural evidence in a text exchange?

### The Scenario

```
Person A: I've been thinking about what you said
Person B: Which part?
Person A: All of it honestly
Person B: Ok
Person A: I think you were right
Person B: I know. But thank you for saying that.
```

**What's happening between these two people?**

- Person A is apologizing and Person B is accepting gracefully
- Person B is asserting dominance — making Person A admit they were wrong
- Both are reconnecting, but Person B is still guarded
- Person A is trying to end the conflict and Person B isn't ready to move on

**Correct answer:** Both are reconnecting, but Person B is still guarded

---

## Exercise 4: Micro-Scenario (Behavioral Style)

**What it tests:** When you're under social or emotional pressure, what's your instinctive response? No correct answer — each option maps to a behavioral style.

### The Scenario

"You're in a group meeting and share an idea. It gets a lukewarm response and the conversation moves on. A few minutes later, someone else brings up essentially the same idea in slightly different words and everyone responds enthusiastically. What's your first instinct?"

- Speak up and point out you said the same thing earlier (Direct)
- Say nothing in the meeting but bring it up with the person privately later (Strategic)
- Let it go — what matters is that the idea is moving forward (Accommodating)
- Say nothing and stew about it for the rest of the day (Internalizing)

---

# HOW THE EXERCISES FEED THE INSIGHT

- Exercise 1: Attribution style (external-cause / belonging / generous / interpersonal-tension)
- Exercise 2: Listening orientation (trusts-surface / reads-hurt / reads-strategy / reads-mixed-feelings)
- Exercise 3: Correct/incorrect + which wrong answer they chose
- Exercise 4: Behavioral style selection

The AI has: interpretation patterns (what the user defaults to when reading ambiguity), one perception accuracy data point (exercise 3), and behavioral instinct. The insight can reference patterns: "When things are ambiguous, you assume the problem is about you — you read relational threat into both scenarios. But when you can see a clear dynamic between two other people, you're accurate. Your perception is sharp when you're not in the picture. It gets distorted when you are."
