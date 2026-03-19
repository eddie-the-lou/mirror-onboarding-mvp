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
import { AutoAdvance } from './components/screens/AutoAdvance';
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
    } else {
      // Free response truncation based on which free screen we’re on.
      const freeScreens = ['free1', 'free2', 'free3', 'free4', 'free5', 'free6'] as const;
      const lastFreeIndexKept = freeScreens.reduce((acc, id, idx) => {
        if (keepThrough.has(id)) return idx;
        return acc;
      }, -1);

      const keepResponses = Math.max(0, lastFreeIndexKept + 1);
      next.interview.freeResponses = next.interview.freeResponses.slice(0, keepResponses);
      // dynamicQuestions contains the question used for each step (index) and preloaded next ones.
      next.interview.dynamicQuestions = next.interview.dynamicQuestions.slice(0, Math.max(0, keepResponses + 1));
      next.interview.draftResponses = next.interview.draftResponses.slice(0, Math.max(0, keepResponses + 1));
      next.interview.allowedFreeSteps = Math.min(next.interview.allowedFreeSteps, keepResponses);
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

function isScreenApplicable(screenId: string, data: OnboardingData): boolean {
  const match = /^free(\d+)$/.exec(screenId);
  if (match) {
    const n = Number(match[1]);
    if (!Number.isFinite(n)) return false;
    return n <= (data.interview.allowedFreeSteps || 0);
  }

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
  const abVersion: OnboardingData['abVersion'] = Math.random() < 0.5 ? 'A' : 'B';
  return {
    user: {
      name: '',
      age: null,
      gender: '',
      source: '',
      email: '',
    },
    abVersion,
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [insightStartedAtMs, setInsightStartedAtMs] = useState<number>(() => Date.now());
  const isPlaceholderResults =
    !state.data.results || 'error' in (state.data.results as unknown as Record<string, unknown>);

  const currentScreenId = ONBOARDING_SCREENS[state.index];

  const EVIDENCE_THRESHOLD = 0.72;

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

    const decideContinueOrGenerate = async ({
      path,
      stepIndex,
      question,
      response,
    }: {
      path: NonNullable<OnboardingData['interview']['path']>;
      stepIndex: number;
      question: string;
      response: string;
    }) => {
      const isLastPlannedTurn = stepIndex + 1 >= state.data.interview.allowedFreeSteps;
      const { nextQ, evidenceScore, shouldContinue } = await callNextQuestion({
        path,
        stepIndex,
        lastQuestion: question,
        lastResponse: response,
        isLastPlannedTurn,
      });

      dispatch({ type: 'setEvidenceScore', value: evidenceScore });

      if (
        isLastPlannedTurn &&
        shouldContinue &&
        state.data.interview.allowedFreeSteps < state.data.interview.maxFreeSteps &&
        nextQ
      ) {
        const nextAllowed = state.data.interview.allowedFreeSteps + 1;
        dispatch({ type: 'setAllowedFreeSteps', value: nextAllowed });
        dispatch({ type: 'setDynamicQuestion', stepIndex: stepIndex + 1, question: nextQ });
        dispatch({ type: 'setDraftResponse', stepIndex: stepIndex + 1, value: '' });
        dispatch({ type: 'next' });
        return;
      }

      // Otherwise: generate results now.
      const nextData: OnboardingData = {
        ...state.data,
        interview: {
          ...state.data.interview,
          freeResponses: [...state.data.interview.freeResponses, { question, response }],
        },
      };
      await runInsight(nextData);
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
            version={state.data.abVersion}
            selectedOptionId={state.data.quickRead.exercise1.answer || undefined}
            onSelect={(answer) => dispatch({ type: 'answerExercise', index: 1, answer })}
          />
        );
      case 'exercise2':
        return (
          <Exercise
            id={2}
            version={state.data.abVersion}
            selectedOptionId={state.data.quickRead.exercise2.answer || undefined}
            onSelect={(answer) => dispatch({ type: 'answerExercise', index: 2, answer })}
          />
        );
      case 'exercise3':
        return (
          <Exercise
            id={3}
            version={state.data.abVersion}
            selectedOptionId={state.data.quickRead.exercise3.answer || undefined}
            onSelect={(answer) => dispatch({ type: 'answerExercise', index: 3, answer })}
          />
        );
      case 'exercise4':
        return (
          <Exercise
            id={4}
            version={state.data.abVersion}
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
      case 'free1': {
        const path = state.data.interview.path;
        if (!path) return null;
        if (path === 'A') {
          const prompt =
            state.data.interview.dynamicQuestions[0] ||
            state.data.interview.situationPromptSelected ||
            'Tell me about the moment this pattern showed up most clearly. What happened, and what changed inside you?';
          const question = withDetailLine(prompt);
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[0] ?? state.data.interview.freeResponses[0]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 0, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                // Always preload the next question.
                dispatch({ type: 'setDraftResponse', stepIndex: 1, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 0,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 1, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        if (path === 'B') {
          const prompt =
            state.data.interview.dynamicQuestions[0] ||
            state.data.interview.situationPromptSelected ||
            'Set the scene for me. Where were you, what was happening on the surface, and what was happening underneath?';
          const question = withDetailLine(prompt);
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[0] ?? state.data.interview.freeResponses[0]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 0, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                dispatch({ type: 'setDraftResponse', stepIndex: 1, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 0,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 1, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        if (path === 'C') {
          const question =
            state.data.interview.dynamicQuestions[1] ||
            "What's the outcome you're most afraid of here? Not the practical worst case — the emotional worst case.";
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[1] ?? state.data.interview.freeResponses[1]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 1, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                dispatch({ type: 'setDraftResponse', stepIndex: 2, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 1,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 2, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        return null;
      }
      case 'free2': {
        const path = state.data.interview.path;
        if (!path) return null;
        if (path === 'A') {
          const question =
            state.data.interview.dynamicQuestions[1] ||
            'When you noticed that shift — what did you actually do? Not what you wish you\'d done. What happened next?';
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[1] ?? state.data.interview.freeResponses[1]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 1, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                dispatch({ type: 'setDraftResponse', stepIndex: 2, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 1,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 2, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        if (path === 'B') {
          const question =
            state.data.interview.dynamicQuestions[1] ||
            "What do you think they were feeling in that moment? And what makes you think that — what were the signals?";
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[1] ?? state.data.interview.freeResponses[1]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 1, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                dispatch({ type: 'setDraftResponse', stepIndex: 2, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 1,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 2, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        if (path === 'C') {
          const question =
            state.data.interview.dynamicQuestions[2] ||
            'And what would you normally do in a situation like this? Not the ideal response — your actual default when you\'re under this kind of pressure.';
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[2] ?? state.data.interview.freeResponses[2]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 2, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                dispatch({ type: 'setDraftResponse', stepIndex: 3, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 2,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 3, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        return null;
      }
      case 'free3': {
        const path = state.data.interview.path;
        if (!path) return null;
        if (path === 'A') {
          const question =
            state.data.interview.dynamicQuestions[2] ||
            'Has that exact sequence — the shift, followed by what you just described — happened before? In a different relationship or a completely different situation?';
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[2] ?? state.data.interview.freeResponses[2]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 2, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                dispatch({ type: 'setDraftResponse', stepIndex: 3, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 2,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 3, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        if (path === 'B') {
          const question =
            state.data.interview.dynamicQuestions[2] ||
            'Now — what were you feeling? Not what you thought about their feelings. What was going on inside you, separately?';
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[2] ?? state.data.interview.freeResponses[2]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 2, value })}
              onSubmit={async (response) => {
                dispatch({ type: 'addFreeResponse', question, response });
                dispatch({ type: 'setDraftResponse', stepIndex: 3, value: '' });
                try {
                  const { nextQ, evidenceScore } = await callNextQuestion({
                    path,
                    stepIndex: 2,
                    lastQuestion: question,
                    lastResponse: response,
                    isLastPlannedTurn: false,
                  });
                  dispatch({ type: 'setEvidenceScore', value: evidenceScore });
                  if (nextQ) dispatch({ type: 'setDynamicQuestion', stepIndex: 3, question: nextQ });
                } finally {
                  dispatch({ type: 'next' });
                }
              }}
            />
          );
        }
        if (path === 'C') {
          const question =
            state.data.interview.dynamicQuestions[3] ||
            "What's the gap between those two things — what you'd default to and what you wish you'd do instead? What gets in the way?";
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[3] ?? state.data.interview.freeResponses[3]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 3, value })}
              onSubmit={async (response) => {
                await decideContinueOrGenerate({ path, stepIndex: 3, question, response });
              }}
            />
          );
        }
        return <AutoAdvance onNext={() => dispatch({ type: 'next' })} />;
      }
      case 'free4': {
        const path = state.data.interview.path;
        if (!path) return null;
        if (path === 'A') {
          const question =
            state.data.interview.dynamicQuestions[3] ||
            "Last question. When you imagine someone who really knows you hearing this story — what part would they say you're leaving out or downplaying?";
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[3] ?? state.data.interview.freeResponses[3]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 3, value })}
              onSubmit={async (response) => {
                await decideContinueOrGenerate({ path, stepIndex: 3, question, response });
              }}
            />
          );
        }
        if (path === 'B') {
          const question =
            state.data.interview.dynamicQuestions[3] ||
            'If you had said something in that moment — named what was happening — what do you think would have happened? Walk me through what you imagine.';
          return (
            <GuidedExploration
              question={question}
              value={state.data.interview.draftResponses[3] ?? state.data.interview.freeResponses[3]?.response ?? ''}
              onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex: 3, value })}
              onSubmit={async (response) => {
                await decideContinueOrGenerate({ path, stepIndex: 3, question, response });
              }}
            />
          );
        }
        return <AutoAdvance onNext={() => dispatch({ type: 'next' })} />;
      }
      case 'free5': {
        const path = state.data.interview.path;
        if (!path) return null;
        const stepIndex = 4;
        const fallback =
          path === 'B'
            ? "One more concrete moment. What did you *not* say or do — and why?"
            : path === 'C'
            ? "Give me one specific moment this week where this showed up. What happened, and what did you do next?"
            : "One more specific example. What happened, and what was your role in it?";
        const question = state.data.interview.dynamicQuestions[4] || withDetailLine(fallback);
        return (
          <GuidedExploration
            question={question}
            value={state.data.interview.draftResponses[4] ?? state.data.interview.freeResponses[4]?.response ?? ''}
            onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex, value })}
            onSubmit={async (response) => {
              await decideContinueOrGenerate({ path, stepIndex, question, response });
            }}
          />
        );
      }
      case 'free6': {
        const path = state.data.interview.path;
        if (!path) return null;
        const stepIndex = 5;
        const fallback =
          "Last one. If someone who knows you well heard what you've said, what would they say you're missing or downplaying?";
        const question = state.data.interview.dynamicQuestions[5] || withDetailLine(fallback);
        return (
          <GuidedExploration
            question={question}
            value={state.data.interview.draftResponses[5] ?? state.data.interview.freeResponses[5]?.response ?? ''}
            onChange={(value) => dispatch({ type: 'setDraftResponse', stepIndex, value })}
            onSubmit={async (response) => {
              await decideContinueOrGenerate({ path, stepIndex, question, response });
            }}
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
    runInsight,
    state.data,
    insightStartedAtMs,
  ]);

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreenId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="w-full max-w-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Back"
              onClick={() => dispatch({ type: 'prev' })}
              disabled={state.index === 0 || loadingInsight}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--mirror-muted)_60%,transparent)] text-[color:var(--mirror-fg)] transition-colors hover:border-[color:var(--mirror-accent)] hover:text-[color:var(--mirror-accent)] disabled:opacity-30 disabled:hover:border-[color-mix(in_oklab,var(--mirror-muted)_60%,transparent)] disabled:hover:text-[color:var(--mirror-fg)]"
            >
              ←
            </button>
            <div className="h-10 w-10" />
          </div>
          {Screen}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

