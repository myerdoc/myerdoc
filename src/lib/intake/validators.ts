import { IntakeResponseValue } from './types';

export function isValidIntakeValue(value: IntakeResponseValue): boolean {
  return value !== undefined;
}