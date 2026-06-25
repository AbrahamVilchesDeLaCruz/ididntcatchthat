import { DataSource } from 'typeorm';
import { buildTypeOrmDataSourceOptions } from './typeorm-data-source-options';

export const AppDataSource = new DataSource(buildTypeOrmDataSourceOptions());
