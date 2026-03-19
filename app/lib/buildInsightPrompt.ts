import { readFileSync } from 'fs';
import { join } from 'path';
import type { OnboardingData } from './types';
import { getExercise } from './exercises';

export function buildInsightPrompt(data: OnboardingData): string {
  const template = readFileSync(
    join(process.cwd(), 'prompts', 'mirror-insight-prompt-template.md'),
    'utf-8',
  );

  const ex1 = getExercise(data.abVersion, 1);
  const ex2 = getExercise(data.abVersion, 2);
  const ex3 = getExercise(data.abVersion, 3);
  const ex4 = getExercise(data.abVersion, 4);

  const resolveAnswerLabel = (exercise: { options: Array<{ id: string; label: string }> }, raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return 'no answer recorded';
    const match = exercise.options.find((o) => o.id === trimmed);
    return match?.label ?? trimmed;
  };

  return template
    .replace('{user_name}', data.user.name || 'this person')
    .replace('{user_age}', data.user.age != null ? String(data.user.age) : 'unknown')
    .replace('{user_gender}', data.user.gender || 'unspecified')
    .replace('{how_they_found_mirror}', data.user.source || 'unspecified')
    .replace('{exercise_1_scenario}', ex1.scenario)
    .replace('{user_answer_1}', resolveAnswerLabel(ex1, data.quickRead.exercise1.answer))
    .replace('{exercise_2_scenario}', ex2.scenario)
    .replace('{user_answer_2}', resolveAnswerLabel(ex2, data.quickRead.exercise2.answer))
    .replace('{exercise_3_scenario}', ex3.scenario)
    .replace('{user_answer_3}', resolveAnswerLabel(ex3, data.quickRead.exercise3.answer))
    .replace('{exercise_4_scenario}', ex4.scenario)
    .replace('{user_answer_4}', resolveAnswerLabel(ex4, data.quickRead.exercise4.answer))
    .replace('{exact_text_of_intent_selection}', data.interview.intent || '')
    .replace('{context_selection_1}', data.interview.contextSelections[0] || '')
    .replace('{context_selection_2}', data.interview.contextSelections[1] || '')
    .replace('{exact_text_of_prompt_they_chose}', data.interview.situationPromptSelected || '')
    .replace('{question_1}', data.interview.freeResponses[0]?.question || '')
    .replace('{user_free_response_1}', data.interview.freeResponses[0]?.response || '')
    .replace('{question_2}', data.interview.freeResponses[1]?.question || '')
    .replace('{user_free_response_2}', data.interview.freeResponses[1]?.response || '')
    .replace('{question_3}', data.interview.freeResponses[2]?.question || '')
    .replace('{user_free_response_3}', data.interview.freeResponses[2]?.response || '')
    .replace('{question_4}', data.interview.freeResponses[3]?.question || '')
    .replace('{user_free_response_4}', data.interview.freeResponses[3]?.response || '');
}

