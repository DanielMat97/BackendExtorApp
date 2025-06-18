import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Report } from '../reports/entities/report.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'extorsion_reports',
  entities: [Report],
  synchronize: true, // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
}; 