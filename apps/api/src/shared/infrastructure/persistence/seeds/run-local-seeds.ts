import { AppDataSource } from '../typeorm/typeorm.config.cli';
import { seedLocalDemo } from './local-demo.seed';

async function run(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await seedLocalDemo(AppDataSource);
  await AppDataSource.destroy();
}

run().catch((error: unknown) => {
  process.stderr.write(`Local seed failed: ${String(error)}\n`);
  process.exit(1);
});
