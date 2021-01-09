import { WATERMARKS } from './types';

export const defaultWaterMarks: WATERMARKS = {
  statements: [50, 100],
  branches: [50, 100],
  functions: [50, 100],
  lines: [50, 100],
};
