/**
 * E2E test environment setup
 *
 * Loads .env.test before any NestJS module is bootstrapped.
 * This file is referenced by jest.e2e.config.ts → setupFiles.
 *
 * dotenv/config reads `.env` by default — we override the path to `.env.test`
 * so E2E tests always use the local test DB, never Aiven or prod credentials.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
