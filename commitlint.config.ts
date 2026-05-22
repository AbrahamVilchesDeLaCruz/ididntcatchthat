import { type UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // ─── Type ─────────────────────────────────────────────────────────────
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'chore', 'refactor', 'test', 'perf', 'ci', 'revert'],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // ─── Scope ────────────────────────────────────────────────────────────
    // Optional but must be lowercase if present
    'scope-case': [2, 'always', 'lower-case'],

    // ─── Subject ──────────────────────────────────────────────────────────
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 100],

    // ─── Body ─────────────────────────────────────────────────────────────
    'body-max-line-length': [2, 'always', 120],

    // ─── Header ───────────────────────────────────────────────────────────
    'header-max-length': [2, 'always', 120],
  },
};

export default config;
