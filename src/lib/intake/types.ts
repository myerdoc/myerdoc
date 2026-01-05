import { INTAKE_KEYS } from './questionKeys';

export type IntakeQuestionKey =
  typeof INTAKE_KEYS[keyof typeof INTAKE_KEYS][keyof typeof INTAKE_KEYS[keyof typeof INTAKE_KEYS]];

export type IntakeResponseValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];