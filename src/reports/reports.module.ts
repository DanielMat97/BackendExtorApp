import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ReportsController } from './controllers/reports.controller';
import { ReportService } from './services/report.service';
import { ValidationService } from './services/validation.service';
import { Report } from './entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 5, // 5 peticiones por minuto por defecto
      },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportService, ValidationService],
  exports: [ReportService, ValidationService],
})
export class ReportsModule {} 