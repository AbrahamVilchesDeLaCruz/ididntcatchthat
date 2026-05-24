/**
 * Merges coverage/unit/coverage-final.json + coverage/e2e/coverage-final.json
 * into a single combined report using istanbul packages already in the monorepo.
 *
 * Usage: node scripts/merge-coverage.mjs
 */
import istanbulCoverage from 'istanbul-lib-coverage';
import istanbulReport from 'istanbul-lib-report';
import istanbulReports from 'istanbul-reports';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const { createCoverageMap } = istanbulCoverage;
const { createContext } = istanbulReport;

const ROOT = process.cwd();

const sources = [
  resolve(ROOT, 'coverage/unit/coverage-final.json'),
  resolve(ROOT, 'coverage/e2e/coverage-final.json'),
];

const map = createCoverageMap({});

for (const src of sources) {
  if (!existsSync(src)) {
    console.warn(`[merge-coverage] skipping missing file: ${src}`);
    continue;
  }
  const data = JSON.parse(readFileSync(src, 'utf8'));
  map.merge(data);
}

const context = createContext({
  dir: resolve(ROOT, 'coverage'),
  coverageMap: map,
});

for (const reporter of ['text', 'lcov', 'html']) {
  istanbulReports.create(reporter).execute(context);
}

console.log('\n[merge-coverage] combined report written to coverage/');
