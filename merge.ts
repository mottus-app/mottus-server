import * as fs from 'fs';
import * as libCoverage from 'istanbul-lib-coverage';
import * as libReport from 'istanbul-lib-report';
import * as reports from 'istanbul-reports';
import * as path from 'path';
import {
  checkFinalCoverage,
  defaultWaterMarks,
  readDirectoryRecursive,
} from './scripts';

async function main() {
  const reportFiles = readDirectoryRecursive(
    'coverage',
    'coverage-final.json',
    '',
  );

  const map = libCoverage.createCoverageMap();

  reportFiles.forEach((file) => {
    const finalReport: Record<
      string,
      libCoverage.FileCoverageData
    > = JSON.parse(
      fs.readFileSync(path.join(__dirname, file), { encoding: 'utf8' }),
    );
    Object.values(finalReport).forEach((fileReport) => {
      map.addFileCoverage(fileReport);
    });
  });

  const context = libReport.createContext({
    dir: './coverage',
    coverageMap: map,
    watermarks: defaultWaterMarks,
  });

  const jsonSummary: libReport.ReportBase = (reports.create(
    'json-summary',
  ) as unknown) as libReport.ReportBase;
  const lcov: libReport.ReportBase = (reports.create(
    'lcov',
    {},
  ) as unknown) as libReport.ReportBase;

  jsonSummary.execute(context);
  lcov.execute(context);
  const { length } = await checkFinalCoverage(defaultWaterMarks);
  return length ? process.exit(1) : false;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
