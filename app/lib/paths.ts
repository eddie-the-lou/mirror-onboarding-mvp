import type { InterviewPath } from './types';

export type IntentOption = {
  label: string;
  path: InterviewPath;
};

export const INTENT_OPTIONS: IntentOption[] = [
  {
    label: 'Help me understand what patterns are holding me back',
    path: 'A',
  },
  {
    label: 'Help me navigate a relationship in my life',
    path: 'B',
  },
  {
    label: "Help me think through something I'm dealing with",
    path: 'C',
  },
];

export const PATH_A_WHERE_OPTIONS = [
  'In my romantic relationships',
  'In my friendships or family',
  'At work or in my career',
  'In how I feel about myself generally',
  'Honestly, everywhere',
] as const;

export const PATH_A_WHAT_OPTIONS: Record<(typeof PATH_A_WHERE_OPTIONS)[number], string[]> = {
  'In my romantic relationships': [
    'I keep attracting or choosing the same kind of person',
    'Things start great and then fall apart the same way',
    'I hold back from fully committing or opening up',
    'I lose myself in relationships',
    "I'm not sure — I just know something keeps repeating",
  ],
  'In my friendships or family': [
    'I end up in the same role every time — the caretaker, the peacekeeper, the one who compromises',
    'I keep having the same kind of falling out',
    'I hold people at a distance without meaning to',
    'I give more than I get and then resent it',
    "I'm not sure — I just know something keeps repeating",
  ],
  'At work or in my career': [
    'I keep hitting the same ceiling no matter what I try',
    "I don't speak up when I should and then regret it",
    'I take on too much and burn out',
    "I'm successful but it doesn't feel like enough",
    "I'm not sure — I just know something keeps repeating",
  ],
  'In how I feel about myself generally': [
    "I know what I should do but I can't seem to do it",
    "I feel stuck but I can't pinpoint why",
    "I'm hard on myself in ways that don't make sense",
    'I avoid things that I know would be good for me',
    "I'm not sure — I just know something keeps repeating",
  ],
  'Honestly, everywhere': [], // handled specially in UI
};

export const PATH_B_WHO_OPTIONS = [
  'My partner or someone I\'m dating',
  'A close friend',
  'A family member',
  'Someone at work',
  "Someone I've lost or am losing",
] as const;

export const PATH_B_WHAT_OPTIONS: Record<(typeof PATH_B_WHO_OPTIONS)[number], string[]> = {
  "My partner or someone I'm dating": [
    "There's tension that neither of us is addressing",
    "We had a conflict and I'm not sure how to repair it",
    "I feel like they don't understand something important about me",
    "The dynamic has shifted and I don't know why",
    "I need to have a hard conversation and I'm avoiding it",
  ],
  'A close friend': [
    "Something shifted between us and I can't pinpoint it",
    "I feel like I'm always the one making the effort",
    "There's something I need to say but I'm afraid it'll change things",
    'We keep having the same misunderstanding',
    "I'm questioning whether this friendship is still working",
  ],
  'A family member': [
    "There's an old dynamic that keeps playing out",
    "Something happened and we're not past it",
    'I feel like I become a different person around them',
    "I want to be closer but something is in the way",
    "I need to set a boundary and I don't know how",
  ],
  'Someone at work': [
    "There's tension that's affecting my work",
    'I feel like they have the wrong read on me',
    "I need to address something and I'm dreading it",
    "They're difficult and I don't know how to handle them",
    "The power dynamic makes it hard to be honest",
  ],
  "Someone I've lost or am losing": [
    "I'm trying to make sense of why it ended",
    "I'm holding onto something and I'm not sure I should be",
    "There's something I never said",
    "I'm not sure if I should try to repair it or let it go",
  ],
};

export const PATH_C_WHAT_KIND_OPTIONS = [
  'A decision I need to make',
  'A conflict or confrontation',
  "Something that happened that I'm still processing",
  'Something coming up that I\'m anxious about',
] as const;

export const PATH_C_DETAILS_OPTIONS: Record<(typeof PATH_C_WHAT_KIND_OPTIONS)[number], string[]> = {
  'A conflict or confrontation': [
    'My partner or someone I\'m dating',
    'A friend or family member',
    'Someone at work',
    "Honestly, it's more with myself",
  ],
  'A decision I need to make': [
    "I know what I should do but I can't bring myself to do it",
    "I genuinely don't know what I want",
    'Other people are affected and I\'m worried about that',
    "I keep going back and forth and I can't commit",
  ],
  "Something that happened that I'm still processing": [
    'Something someone said or did',
    'How I handled a situation',
    "A feeling I can't shake and can't explain",
    "A realization about myself I'm not sure what to do with",
  ],
  "Something coming up that I'm anxious about": [
    "I don't know how the other person will react",
    "I don't know what I actually want to say",
    "I'm worried I'll handle it badly",
    "I keep avoiding it and I don't fully understand why",
  ],
};

export type SituationPromptKeyA = 'romantic_shift' | 'romantic_fall_apart' | 'partner_tension';

export const PATH_A_SITUATION_PROMPTS: Record<SituationPromptKeyA, string[]> = {
  romantic_shift: [
    'Think about the moment in your last relationship where you first knew something had shifted.',
    "Think about what your last two partners would say went wrong — and whether they'd say similar things.",
    'Think about what you do when a relationship starts going really well. What changes inside you?',
  ],
  romantic_fall_apart: [
    'Think about how the last two relationships actually ended — what was the final straw in each?',
    'Think about the point where things first started to feel off, before they fully fell apart.',
    "Think about what you did differently in those last months — and what didn't change at all.",
  ],
  partner_tension: [
    'Describe a recent moment where you both felt the tension but neither of you named it.',
    "What's the thing you most want to say to them but haven't?",
    "If they were here right now and I asked them what's wrong, what do you think they'd say?",
  ],
};

export const PATH_A_FALLBACK_PROMPTS = [
  'Think about the last time this pattern showed up. What happened?',
  'Think about what someone close to you would say about this pattern.',
  'Think about the moment you first noticed this was a pattern, not a one-time thing.',
];

export const PATH_B_FALLBACK_PROMPTS = [
  'Describe a recent moment that captures what\'s going on between you two.',
  "What's the thing you most want them to understand about you?",
  "If they were here right now, what do you think they'd say is the problem?",
];

