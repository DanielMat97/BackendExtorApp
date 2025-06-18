import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ReportStatus } from '../entities/report.entity';

export class GetReportsDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class GetReportsResponseDto {
  reports: Array<{
    id: string;
    caseNumber: string;
    phoneNumber: string;
    incidentDate: Date;
    description: string;
    hasEvidence: boolean;
    isAnonymous: boolean;
    status: ReportStatus;
    createdAt: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 