import * as libReport from 'istanbul-lib-report';
export type WATERMARKS = libReport.Watermarks;

export interface TotalSection {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

export enum CoverageStatus {
  ERROR = 'ERROR',
  GOOD = 'GOOD',
  PERFECT = 'PERFECT',
}

interface EachStatus {
  status: CoverageStatus;
  value: number;
}

export type StatusReport = {
  [K in keyof libReport.Watermarks]: EachStatus;
};
