import * as fsExtra from 'fs-extra';
import { join } from 'path';
import {
  defaultWaterMarks,
  getCoverageDir,
  keyPassingOrPassing,
  smallerMsg,
  TotalSection,
  WATERMARKS,
} from './utils';
export * from './utils';
export * from './funcs';

export async function checkFinalCoverage(
  watermarks: WATERMARKS = defaultWaterMarks,
) {
  const coverageDir = getCoverageDir();
  const { total: finalCoverage } = await fsExtra.readJSON(
    join(coverageDir, 'coverage', 'coverage-summary.json'),
  );

  const entriesOfStatus = Object.entries(finalCoverage);

  return entriesOfStatus.filter((el: [keyof WATERMARKS, TotalSection]) => {
    const [minThresh, maxThresh] = watermarks[el[0]];
    const [name, { pct: currentPerc }] = el;
    if (currentPerc < minThresh) {
      console.log(
        `${keyPassingOrPassing(name, 'red')}${smallerMsg(
          `is failing with ${currentPerc}`,
          'red',
        )}`,
      );
      return true;
    }
    if (currentPerc < maxThresh) {
      return console.log(
        `${keyPassingOrPassing(name, 'yellow')}${smallerMsg(
          `is okay. Could be better. ${currentPerc}`,
          'yellow',
        )}`,
      );
    }
    return console.log(
      `${keyPassingOrPassing(name, 'green')}${smallerMsg(
        'is perfect',
        'green',
      )}`,
    );
  });
}
