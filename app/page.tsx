'use client';

import { useCallback, useMemo, useReducer, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ONBOARDING_SCREENS } from './lib/onboardingFlow';
import type { OnboardingData } from './lib/types';
import { Thesis } from './components/screens/Thesis';
import { Exercise } from './components/screens/Exercise';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { QuickReadReveal } from './components/screens/QuickReadReveal';
import { AccuracyScreen } from './components/screens/AccuracyScreen';
import { IntentSelect } from './components/screens/IntentSelect';
import { ContextSelect } from './components/screens/ContextSelect';
import { SituationProposal } from './components/screens/SituationProposal';
import { GuidedExploration } from './components/screens/GuidedExploration';
import { InsightChat } from './components/screens/InsightChat';
import { AutoAdvance } from './components/screens/AutoAdvance';
import { ProgressBar } from './components/ProgressBar';
import {
  PATH_A_WHERE_OPTIONS,
  PATH_A_WHAT_OPTIONS,
  PATH_B_WHO_OPTIONS,
  PATH_B_WHAT_OPTIONS,
  PATH_C_WHAT_KIND_OPTIONS,
  PATH_C_DETAILS_OPTIONS,
  PATH_A_SITUATION_PROMPTS,
  PATH_A_FALLBACK_PROMPTS,
  PATH_B_FALLBACK_PROMPTS,
} from './lib/paths';

type Action =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'setName'; name: string }
  | { type: 'setAge'; age: number | null }
  | { type: 'setGender'; gender: string }
  | { type: 'setSource'; source: string }
  | { type: 'setIntent'; intent: string; path: OnboardingData['interview']['path'] }
  | { type: 'setContext'; index: number; value: string }
  | { type: 'setSituationPrompt'; prompt: string }
  | { type: 'setDraftResponse'; stepIndex: number; value: string }
  | { type: 'addFreeResponse'; question: string; response: string }
  | { type: 'setDynamicQuestion'; stepIndex: number; question: string }
  | { type: 'setAllowedFreeSteps'; value: number }
  | { type: 'setEvidenceScore'; value: number | null }
  | { type: 'setResults'; payload: NonNullable<OnboardingData['results']> }
  | { type: 'setReaction'; rating: string; pushbackText: string | null }
  | { type: 'answerExercise'; index: 1 | 2 | 3 | 4; answer: string };

interface State {
  index: number;
  data: OnboardingData;
}

function resetDownstreamData(data: OnboardingData, targetIndex: number): OnboardingData {
  const keepThrough = new Set<string>();

  // Keep everything through the target screen, clear anything logically "after".
  for (let i = 0; i <= targetIndex; i += 1) keepThrough.add(ONBOARDING_SCREENS[i]);

  // Avoid structuredClone here; it can break Next's server bundle in dev.
  const next = JSON.parse(JSON.stringify(data)) as OnboardingData;

  // If we go back before results are generated, wipe results + reaction.
  if (!keepThrough.has('loading')) {
    next.results = null;
    next.reaction = { rating: '', pushbackText: null };
  }

  // Interview clearing by phase.
  if (!keepThrough.has('intent')) {
    next.interview.intent = '';
    next.interview.path = null;
    next.interview.contextSelections = [];
    next.interview.situationPromptSelected = '';
    next.interview.freeResponses = [];
    next.interview.dynamicQuestions = [];
    next.interview.draftResponses = [];
  } else {
    if (!keepThrough.has('context1')) {
      next.interview.contextSelections = [];
      next.interview.situationPromptSelected = '';
      next.interview.freeResponses = [];
      next.interview.dynamicQuestions = [];
      next.interview.draftResponses = [];
    } else if (!keepThrough.has('context2')) {
      next.interview.contextSelections = next.interview.contextSelections.slice(0, 1);
      next.interview.situationPromptSelected = '';
      next.interview.freeResponses = [];
      next.interview.dynamicQuestions = [];
      next.interview.draftResponses = [];
    } else if (!keepThrough.has('situation')) {
      next.interview.situationPromptSelected = '';
      next.interview.freeResponses = [];
      next.interview.dynamicQuestions = [];
      next.interview.draftResponses = [];
    } else if (!keepThrough.has('insightChat')) {
      next.interview.freeResponses = [];
      next.interview.dynamicQuestions = [];
      next.interview.draftResponses = [];
      next.interview.allowedFreeSteps =
        next.interview.path === 'A' || next.interview.path === 'B' ? 4 : next.interview.path ? 3 : 0;
      next.interview.evidenceScore = null;
    }
  }

  // Quick read clearing.
  if (!keepThrough.has('exercise1')) {
    next.quickRead.exercise1.answer = '';
    next.quickRead.exercise2.answer = '';
    next.quickRead.exercise3.answer = '';
    next.quickRead.exercise4.answer = '';
  } else if (!keepThrough.has('exercise2')) {
    next.quickRead.exercise2.answer = '';
    next.quickRead.exercise3.answer = '';
    next.quickRead.exercise4.answer = '';
  } else if (!keepThrough.has('exercise3')) {
    next.quickRead.exercise3.answer = '';
    next.quickRead.exercise4.answer = '';
  } else if (!keepThrough.has('exercise4')) {
    next.quickRead.exercise4.answer = '';
  }

  return next;
}

function isScreenApplicable(_screenId: string, _data: OnboardingData): boolean {
  return true;
}

function nextApplicableIndex(fromIndex: number, data: OnboardingData): number {
  for (let i = fromIndex + 1; i < ONBOARDING_SCREENS.length; i += 1) {
    if (isScreenApplicable(ONBOARDING_SCREENS[i], data)) return i;
  }
  return fromIndex;
}

function prevApplicableIndex(fromIndex: number, data: OnboardingData): number {
  for (let i = fromIndex - 1; i >= 0; i -= 1) {
    const screenId = ONBOARDING_SCREENS[i];
    if (isScreenApplicable(screenId, data)) return i;
  }
  return fromIndex;
}

function createInitialData(): OnboardingData {
  return {
    user: {
      name: '',
      age: null,
      gender: '',
      source: '',
      email: '',
    },
    quickRead: {
      exercise1: { answer: '' },
      exercise2: { answer: '' },
      exercise3: { answer: '' },
      exercise4: { answer: '' },
    },
    interview: {
      intent: '',
      path: null,
      contextSelections: [],
      situationPromptSelected: '',
      freeResponses: [],
      dynamicQuestions: [],
      draftResponses: [],
      allowedFreeSteps: 0,
      maxFreeSteps: 0,
      evidenceScore: null,
    },
    reaction: {
      rating: '',
      pushbackText: null,
    },
    results: null,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'next': {
      const nextIndex = nextApplicableIndex(state.index, state.data);
      return { ...state, index: nextIndex };
    }
    case 'prev': {
      const prevIndex = prevApplicableIndex(state.index, state.data);
      return {
        ...state,
        index: prevIndex,
        data: resetDownstreamData(state.data, prevIndex),
      };
    }
    case 'setName':
      return {
        ...state,
        data: { ...state.data, user: { ...state.data.user, name: action.name } },
      };
    case 'setAge':
      return {
        ...state,
        data: { ...state.data, user: { ...state.data.user, age: action.age } },
      };
    case 'setGender':
      return {
        ...state,
        data: { ...state.data, user: { ...state.data.user, gender: action.gender } },
      };
    case 'setSource':
      return {
        ...state,
        data: { ...state.data, user: { ...state.data.user, source: action.source } },
      };
    case 'setIntent':
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            intent: action.intent,
            path: action.path,
            // Switching intent/path invalidates downstream interview fields.
            contextSelections: [],
            situationPromptSelected: '',
            freeResponses: [],
            dynamicQuestions: [],
            draftResponses: [],
            evidenceScore: null,
            allowedFreeSteps: action.path === 'A' || action.path === 'B' ? 4 : action.path ? 3 : 0,
            maxFreeSteps: action.path === 'A' || action.path === 'B' ? 6 : action.path ? 5 : 0,
          },
        },
      };
    case 'setDraftResponse': {
      const nextDrafts = [...state.data.interview.draftResponses];
      nextDrafts[action.stepIndex] = action.value;
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            draftResponses: nextDrafts,
          },
        },
      };
    }
    case 'setContext': {
      const nextSelections = [...state.data.interview.contextSelections];
      nextSelections[action.index] = action.value;
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            contextSelections: nextSelections,
          },
        },
      };
    }
    case 'setSituationPrompt':
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            situationPromptSelected: action.prompt,
          },
        },
      };
    case 'addFreeResponse':
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            freeResponses: [
              ...state.data.interview.freeResponses,
              { question: action.question, response: action.response },
            ],
          },
        },
      };
    case 'setDynamicQuestion': {
      const next = [...state.data.interview.dynamicQuestions];
      next[action.stepIndex] = action.question;
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            dynamicQuestions: next,
          },
        },
      };
    }
    case 'setAllowedFreeSteps':
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            allowedFreeSteps: action.value,
          },
        },
      };
    case 'setEvidenceScore':
      return {
        ...state,
        data: {
          ...state.data,
          interview: {
            ...state.data.interview,
            evidenceScore: action.value,
          },
        },
      };
    case 'answerExercise': {
      const key = `exercise${action.index}` as const;
      return {
        ...state,
        data: {
          ...state.data,
          quickRead: {
            ...state.data.quickRead,
            [key]: { answer: action.answer },
          },
        },
        index: nextApplicableIndex(state.index, state.data),
      };
    }
    case 'setResults':
      return {
        ...state,
        data: { ...state.data, results: action.payload },
      };
    case 'setReaction':
      return {
        ...state,
        data: {
          ...state.data,
          reaction: { rating: action.rating, pushbackText: action.pushbackText },
        },
      };
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    index: 0,
    data: createInitialData(),
  }));
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [insightStartedAtMs, setInsightStartedAtMs] = useState<number>(() => Date.now());
  const isPlaceholderResults =
    !state.data.results || 'error' in (state.data.results as unknown as Record<string, unknown>);

  const currentScreenId = ONBOARDING_SCREENS[state.index];

  const progress = useMemo(() => {
    const QUICK_READ_LAST_INDEX = 4; // thesis through exercise4
    const isQuickReadPhase = state.index <= QUICK_READ_LAST_INDEX;

    if (isQuickReadPhase) {
      // Bar fills only after each move: exercise1 shows 0%, after ex1→ex2 shows 25%, etc.
      // completed = screens finished before current (ex1=0, ex2=1, ex3=2, ex4=3)
      const quickReadCompleted = Math.max(0, state.index - 1);
      return {
        phase: 'quickRead' as const,
        quickReadStep: quickReadCompleted,
        quickReadTotal: 4,
        insightStep: 0,
        insightTotal: 1,
      };
    }

    // Insight phase: bar resets to empty, fills after each move
    const insightBarStartIndex = 6;
    const insightChatIndex = ONBOARDING_SCREENS.indexOf('insightChat');
    let insightCompleted = 0;
    let insightTotalCount = 0;
    for (let i = insightBarStartIndex; i < ONBOARDING_SCREENS.length; i += 1) {
      if (isScreenApplicable(ONBOARDING_SCREENS[i], state.data)) {
        insightTotalCount += 1;
        if (i < state.index) insightCompleted += 1;
      }
    }
    if (state.index === insightChatIndex) {
      insightCompleted += state.data.interview.freeResponses.length;
      insightTotalCount = Math.max(
        insightTotalCount,
        3 + (state.data.interview.maxFreeSteps || state.data.interview.allowedFreeSteps || 4)
      );
    }

    return {
      phase: 'insight' as const,
      quickReadStep: 4,
      quickReadTotal: 4,
      insightStep: insightCompleted,
      insightTotal: Math.max(1, insightTotalCount),
    };
  }, [state.index, state.data]);

  const EVIDENCE_THRESHOLD = 0.62;

  const runInsight = useCallback(async (dataOverride?: OnboardingData) => {
    setLoadingInsight(true);
    setLoadError(null);
    setInsightStartedAtMs(Date.now());
    dispatch({ type: 'next' }); // to loading

    const payload = dataOverride ?? state.data;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.errorCode === 'AUTH'
            ? 'Insight engine isn’t authorized. Check your API key and restart the server.'
            : body?.errorCode === 'PARSE'
            ? 'Insight engine returned an invalid response. Try again.'
            : 'Something went wrong. Let me try again.';
        throw new Error(message);
      }
      const json = await res.json();
      if (!json?.quickRead || !json?.insight) {
        throw new Error('Insight engine returned an unexpected response. Try again.');
      }
      dispatch({ type: 'setResults', payload: json });
      dispatch({ type: 'next' }); // loading -> quickReadReveal
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'AbortError'
          ? 'This is taking too long. Want me to try again?'
          : err instanceof Error
          ? err.message
          : 'Something went wrong. Let me try again.';
      setLoadError(message);
    } finally {
      clearTimeout(timeout);
      setLoadingInsight(false);
    }
  }, [state.data]);

  const Screen = useMemo(() => {
    const detailLine = 'The more detail you share, the more I can see.';
    const withDetailLine = (q: string) =>
      q.includes(detailLine) ? q : `${q.replace(/\s+$/g, '')} ${detailLine}`;

    const callNextQuestion = async ({
      path,
      stepIndex,
      lastQuestion,
      lastResponse,
      isLastPlannedTurn,
    }: {
      path: NonNullable<OnboardingData['interview']['path']>;
      stepIndex: number;
      lastQuestion: string;
      lastResponse: string;
      isLastPlannedTurn: boolean;
    }) => {
      const r = await fetch('/api/next-question', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          path,
          stepIndex,
          contextSelections: state.data.interview.contextSelections,
          situationPromptSelected: state.data.interview.situationPromptSelected,
          lastQuestion,
          lastResponse,
          priorFreeResponses: state.data.interview.freeResponses,
          threshold: EVIDENCE_THRESHOLD,
          maxTurns: state.data.interview.maxFreeSteps,
          currentTurn: stepIndex + 1,
          isLastPlannedTurn,
        }),
      });
      const json = r.ok ? await r.json().catch(() => null) : null;
      const nextQ = typeof json?.nextQuestion === 'string' ? json.nextQuestion.trim() : '';
      const evidenceScore =
        typeof json?.evidenceScore === 'number' ? Math.max(0, Math.min(1, json.evidenceScore)) : null;
      const shouldContinue = json?.shouldContinue === true;
      return { nextQ, evidenceScore, shouldContinue };
    };

    switch (currentScreenId) {
      case 'thesis':
        return (
          <Thesis
            onNext={() => {
              dispatch({ type: 'next' });
            }}
          />
        );
      case 'exercise1':
        return (
          <Exercise
            id={1}
            selectedOptionId={state.data.quickRead.exercise1.answer || undefined}
            onSelect={(answer) => dispatch({ type: 'answerExercise', index: 1, answer })}
          />
        );
      case 'exercise2':
        return (
          <Exercise
            id={2}
            selectedOptionId={state.data.quickRead.exercise2.answer || undefined}
            onSelect={(answer) => dispatch({ type: 'answerExercise', index: 2, answer })}
          />
        );
      case 'exercise3':
        return (
          <Exercise
            id={3}
            selectedOptionId={state.data.quickRead.exercise3.answer || undefined}
            onSelect={(answer) => dispatch({ type: 'answerExercise', index: 3, answer })}
          />
        );
      case 'exercise4':
        return (
          <Exercise
            id={4}
            selectedOptionId={state.data.quickRead.exercise4.answer || undefined}
            onSelect={(answer) => dispatch({ type: 'answerExercise', index: 4, answer })}
          />
        );
      case 'intent': {
        return (
          <IntentSelect
            selectedIntent={state.data.interview.intent}
            selectedPath={state.data.interview.path}
            onSelect={(intent, path) => dispatch({ type: 'setIntent', intent, path })}
            onNext={() => dispatch({ type: 'next' })}
          />
        );
      }
      case 'context1': {
        const path = state.data.interview.path;
        if (!path) return null;
        if (path === 'A') {
          return (
            <ContextSelect
              prompt="Where do you feel the pattern most?"
              options={Array.from(PATH_A_WHERE_OPTIONS)}
              selected={state.data.interview.contextSelections[0] ?? ''}
              onSelect={(value) => dispatch({ type: 'setContext', index: 0, value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        if (path === 'B') {
          return (
            <ContextSelect
              prompt="Who's on your mind?"
              options={Array.from(PATH_B_WHO_OPTIONS)}
              selected={state.data.interview.contextSelections[0] ?? ''}
              onSelect={(value) => dispatch({ type: 'setContext', index: 0, value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        if (path === 'C') {
          return (
            <ContextSelect
              prompt="What's going on?"
              options={Array.from(PATH_C_WHAT_KIND_OPTIONS)}
              selected={state.data.interview.contextSelections[0] ?? ''}
              onSelect={(value) => dispatch({ type: 'setContext', index: 0, value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        return null;
      }
      case 'context2': {
        const path = state.data.interview.path;
        if (!path) return null;
        if (path === 'A') {
          const whereRaw = state.data.interview.contextSelections[0] as
            | (typeof PATH_A_WHERE_OPTIONS)[number]
            | undefined;
          const where =
            whereRaw === 'Honestly, everywhere'
              ? 'In how I feel about myself generally'
              : whereRaw;
          const options = where ? PATH_A_WHAT_OPTIONS[where] ?? [] : [];
          return (
            <ContextSelect
              prompt={
                where === 'In my romantic relationships'
                  ? 'What does the pattern feel like?'
                  : where === 'In my friendships or family'
                  ? 'What does the pattern feel like there?'
                  : where === 'At work or in my career'
                  ? 'What does the pattern feel like at work?'
                  : 'What does the pattern feel like?'
              }
              options={options}
              selected={state.data.interview.contextSelections[1] ?? ''}
              onSelect={(value) => dispatch({ type: 'setContext', index: 1, value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        if (path === 'B') {
          const who = state.data.interview.contextSelections[0] as
            | (typeof PATH_B_WHO_OPTIONS)[number]
            | undefined;
          const options = who ? PATH_B_WHAT_OPTIONS[who] ?? [] : [];
          return (
            <ContextSelect
              prompt="What's happening?"
              options={options}
              selected={state.data.interview.contextSelections[1] ?? ''}
              onSelect={(value) => dispatch({ type: 'setContext', index: 1, value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        if (path === 'C') {
          const kind = state.data.interview.contextSelections[0] as
            | (typeof PATH_C_WHAT_KIND_OPTIONS)[number]
            | undefined;
          const options = kind ? PATH_C_DETAILS_OPTIONS[kind] ?? [] : [];
          const prompt =
            kind === 'A conflict or confrontation'
              ? "Who's it with?"
              : kind === 'A decision I need to make'
              ? 'What makes the decision hard?'
              : kind === "Something that happened that I'm still processing"
              ? "What won't let go of you?"
              : "What's making it hard?";
          return (
            <ContextSelect
              prompt={prompt}
              options={options}
              selected={state.data.interview.contextSelections[1] ?? ''}
              onSelect={(value) => dispatch({ type: 'setContext', index: 1, value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        return <AutoAdvance onNext={() => dispatch({ type: 'next' })} />;
      }
      case 'situation': {
        const path = state.data.interview.path;
        if (!path) return null;
        if (path === 'A') {
          const where = state.data.interview.contextSelections[0];
          const what = state.data.interview.contextSelections[1];
          let prompts = PATH_A_FALLBACK_PROMPTS;
          if (where === 'In my romantic relationships' && what === 'Things start great and then fall apart the same way') {
            prompts = PATH_A_SITUATION_PROMPTS.romantic_shift;
          } else if (where === 'In my romantic relationships' && what === 'I keep attracting or choosing the same kind of person') {
            prompts = PATH_A_SITUATION_PROMPTS.romantic_fall_apart;
          }
          return (
            <SituationProposal
              prompts={prompts}
              selected={state.data.interview.situationPromptSelected}
              onSelect={(value) => dispatch({ type: 'setSituationPrompt', prompt: value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        if (path === 'B') {
          const prompts = PATH_B_FALLBACK_PROMPTS;
          return (
            <SituationProposal
              prompts={prompts}
              selected={state.data.interview.situationPromptSelected}
              onSelect={(value) => dispatch({ type: 'setSituationPrompt', prompt: value })}
              onNext={() => dispatch({ type: 'next' })}
            />
          );
        }
        if (path === 'C') {
          const qBase =
            "Tell me what's happening — the situation and the hard part — in whatever way feels natural.";
          const question = withDetailLine(qBase);
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[0] ?? state.data.interview.freeResponses[0]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 0, value })}
              onSubmit={(response) => {
                dispatch({
                  type: 'addFreeResponse',
                  question,
                  response,
                });
                dispatch({ type: 'next' });
              }}
            />
          );
        }
        return <AutoAdvance onNext={() => dispatch({ type: 'next' })} />;
      }
      case 'insightChat': {
        const path = state.data.interview.path;
        if (!path) return null;

        const stepIndex = state.data.interview.freeResponses.length;
        const messages: Array<{ role: 'mirror' | 'user'; text: string }> = state.data.interview.freeResponses.flatMap(
          (fr) => [
            { role: 'mirror' as const, text: fr.question },
            { role: 'user' as const, text: fr.response },
          ]
        );

        const getCurrentQuestion = (): string => {
          const dq = state.data.interview.dynamicQuestions[stepIndex];
          if (dq) return dq;
          if (path === 'A') {
            if (stepIndex === 0)
              return withDetailLine(
                state.data.interview.situationPromptSelected ||
                  'Tell me about the moment this pattern showed up most clearly. What happened, and what changed inside you?'
              );
            const fallbacks = [
              "When you noticed that shift — what did you actually do? Not what you wish you'd done. What happened next?",
              'Has that exact sequence — the shift, followed by what you just described — happened before? In a different relationship or a completely different situation?',
              "Last question. When you imagine someone who really knows you hearing this story — what part would they say you're leaving out or downplaying?",
              withDetailLine("One more specific example. What happened, and what was your role in it?"),
              withDetailLine("Last one. If someone who knows you well heard what you've said, what would they say you're missing or downplaying?"),
            ];
            return fallbacks[Math.min(stepIndex - 1, fallbacks.length - 1)] ?? '';
          }
          if (path === 'B') {
            if (stepIndex === 0)
              return withDetailLine(
                state.data.interview.situationPromptSelected ||
                  "Set the scene for me. Where were you, what was happening on the surface, and what was happening underneath?"
              );
            const fallbacks = [
              "What do you think they were feeling in that moment? And what makes you think that — what were the signals?",
              "Now — what were you feeling? Not what you thought about their feelings. What was going on inside you, separately?",
              'If you had said something in that moment — named what was happening — what do you think would have happened? Walk me through what you imagine.',
              withDetailLine("One more concrete moment. What did you *not* say or do — and why?"),
            ];
            return fallbacks[Math.min(stepIndex - 1, fallbacks.length - 1)] ?? '';
          }
          if (path === 'C') {
            const fallbacks = [
              "What's the outcome you're most afraid of here? Not the practical worst case — the emotional worst case.",
              "And what would you normally do in a situation like this? Not the ideal response — your actual default when you're under this kind of pressure.",
              "What's the gap between those two things — what you'd default to and what you wish you'd do instead? What gets in the way?",
              withDetailLine("Give me one specific moment this week where this showed up. What happened, and what did you do next?"),
              withDetailLine("Last one. If someone who knows you well heard what you've said, what would they say you're missing or downplaying?"),
            ];
            return fallbacks[Math.min(stepIndex, fallbacks.length - 1)] ?? '';
          }
          return '';
        };

        const currentQuestion = getCurrentQuestion();
        const draft = state.data.interview.draftResponses[stepIndex] ?? '';

        const handleSubmit = async (response: string) => {
          dispatch({ type: 'addFreeResponse', question: currentQuestion, response });
          dispatch({ type: 'setDraftResponse', stepIndex: stepIndex + 1, value: '' });
          setLoadingNextQuestion(true);
          try {
            const isLastPlannedTurn = stepIndex + 1 >= state.data.interview.allowedFreeSteps;
            const { nextQ, evidenceScore, shouldContinue } = await callNextQuestion({
              path,
              stepIndex,
              lastQuestion: currentQuestion,
              lastResponse: response,
              isLastPlannedTurn,
            });
            dispatch({ type: 'setEvidenceScore', value: evidenceScore });

            // Not yet at planned turns — always get next question and continue
            if (!isLastPlannedTurn && nextQ) {
              dispatch({ type: 'setDynamicQuestion', stepIndex: stepIndex + 1, question: nextQ });
              return;
            }

            // At last planned turn but API says we need more — extend if possible
            if (
              isLastPlannedTurn &&
              shouldContinue &&
              state.data.interview.allowedFreeSteps < state.data.interview.maxFreeSteps &&
              nextQ
            ) {
              dispatch({ type: 'setAllowedFreeSteps', value: state.data.interview.allowedFreeSteps + 1 });
              dispatch({ type: 'setDynamicQuestion', stepIndex: stepIndex + 1, question: nextQ });
              return;
            }

            // Done — generate insight
            const nextData: OnboardingData = {
              ...state.data,
              interview: {
                ...state.data.interview,
                freeResponses: [...state.data.interview.freeResponses, { question: currentQuestion, response }],
              },
            };
            await runInsight(nextData);
          } finally {
            setLoadingNextQuestion(false);
          }
        };

        return (
          <InsightChat
            messages={messages}
            currentQuestion={currentQuestion}
            draft={draft}
            onDraftChange={(v) => dispatch({ type: 'setDraftResponse', stepIndex, value: v })}
            onSubmit={handleSubmit}
            loading={loadingNextQuestion || loadingInsight}
            placeholder="e.g., We were at dinner and I noticed they got quiet after I mentioned something about the future..."
          />
        );
      }
      case 'loading':
        return (
          <LoadingScreen
            error={loadError}
            onRetry={loadError ? runInsight : null}
            startedAtMs={insightStartedAtMs}
          />
        );
      case 'quickReadReveal':
        return (
          <QuickReadReveal
            quickRead={state.data.results?.quickRead ?? null}
            isPlaceholder={isPlaceholderResults}
            onContinue={() => dispatch({ type: 'next' })}
          />
        );
      case 'reaction':
        return state.data.results?.insight ? (
          <AccuracyScreen insight={state.data.results.insight} />
        ) : null;
      default:
        return null;
    }
  }, [
    currentScreenId,
    isPlaceholderResults,
    loadError,
    loadingInsight,
    loadingNextQuestion,
    runInsight,
    state.data,
    insightStartedAtMs,
  ]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreenId}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              aria-label="Back"
              onClick={() => dispatch({ type: 'prev' })}
              disabled={state.index === 0 || loadingInsight}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mirror-glass-border)] text-[color:var(--mirror-fg)] transition-all duration-200 hover:border-[color:var(--mirror-accent)] hover:bg-[var(--mirror-accent-dim)] hover:text-[color:var(--mirror-accent)] hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:border-[var(--mirror-glass-border)] disabled:hover:bg-transparent disabled:hover:text-[color:var(--mirror-fg)]"
            >
              ←
            </button>
            <span className="text-sm font-semibold tracking-[0.2em] text-[color:var(--mirror-fg-muted)]">
              MIRROR
            </span>
            <div className="h-10 w-10" aria-hidden />
          </div>
          {!['thesis', 'intent', 'insightChat', 'loading', 'quickReadReveal', 'reaction'].includes(currentScreenId) && (
            <ProgressBar
              phase={progress.phase}
              quickReadStep={progress.quickReadStep}
              quickReadTotal={progress.quickReadTotal}
              insightStep={progress.insightStep}
              insightTotal={progress.insightTotal}
            />
          )}
          {Screen}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

