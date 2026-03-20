export type ExerciseId = 1 | 2 | 3 | 4;

type Option = {
  id: string;
  label: string;
};

type ExerciseContent = {
  id: string;
  scenario: string;
  options: Option[];
};

export type ExerciseSet = Record<ExerciseId, ExerciseContent>;

const EXERCISES: ExerciseSet = {
  1: {
    id: 'exercise_1',
    scenario:
      "You're at a small gathering. A friend who's usually talkative and warm greets everyone when they arrive but then spends most of the evening on the edge of conversations — laughing at the right moments, responding when spoken to, but not initiating anything. At one point you catch them staring out the window for a few seconds before someone pulls them back in.",
    options: [
      {
        id: 'external_cause',
        label:
          "They're preoccupied with something unrelated to the gathering — work, a text they got, something on their mind",
      },
      {
        id: 'belonging',
        label: "They're feeling disconnected from this group lately and aren't sure they belong anymore",
      },
      {
        id: 'tired_doing_best',
        label:
          "They're tired or low-energy and doing their best to be present despite not being fully up for it",
      },
      {
        id: 'interpersonal_tension',
        label: 'They had a disagreement with someone at the gathering and they\'re managing the discomfort',
      },
    ],
  },
  2: {
    id: 'exercise_2',
    scenario:
      "You've been dating someone for a few months. After a night out with your friends — which they didn't come to — they say: 'Sounds like you had a great time.'",
    options: [
      {
        id: 'genuinely_glad',
        label: 'They\'re genuinely glad you had fun — no subtext',
      },
      {
        id: 'left_out',
        label: 'They feel left out and are flagging it indirectly',
      },
      {
        id: 'testing',
        label: "They're testing whether you missed them or even noticed they weren't there",
      },
      {
        id: 'slightly_jealous',
        label: "They're fine but slightly jealous of the fun you had without them",
      },
    ],
  },
  3: {
    id: 'exercise_3',
    scenario:
      'Person A: I\'ve been thinking about what you said\nPerson B: Which part?\nPerson A: All of it honestly\nPerson B: Ok\nPerson A: I think you were right\nPerson B: I know. But thank you for saying that.',
    options: [
      {
        id: 'apology_graceful',
        label: 'Person A is apologizing and Person B is accepting gracefully',
      },
      {
        id: 'asserting_dominance',
        label: 'Person B is asserting dominance — making Person A admit they were wrong',
      },
      {
        id: 'reconnecting_guarded',
        label: 'Both are reconnecting, but Person B is still guarded',
      },
      {
        id: 'ending_conflict',
        label: "Person A is trying to end the conflict and Person B isn't ready to move on",
      },
    ],
  },
  4: {
    id: 'exercise_4',
    scenario:
      "You're in a group meeting and share an idea. It gets a lukewarm response and the conversation moves on. A few minutes later, someone else brings up essentially the same idea in slightly different words and everyone responds enthusiastically. What's your first instinct?",
    options: [
      {
        id: 'direct',
        label: 'Speak up and point out you said the same thing earlier',
      },
      {
        id: 'strategic',
        label: 'Say nothing in the meeting but bring it up with the person privately later',
      },
      {
        id: 'accommodating',
        label: 'Let it go — what matters is that the idea is moving forward',
      },
      {
        id: 'internalizing',
        label: 'Say nothing and stew about it for the rest of the day',
      },
    ],
  },
};

export function getExercise(id: ExerciseId): ExerciseContent {
  return EXERCISES[id];
}
