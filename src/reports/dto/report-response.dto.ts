import { ReportStatus } from '../entities/report.entity';

export class ReportResponseDto {
  success: boolean;
  message: string;
  data?: {
    reportId: string;
    caseNumber: string;
    status: ReportStatus;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export class CreateReportResponseDto {
  success: boolean;
  message: string;
  data: {
    reportId: string;
    caseNumber: string;
    status: ReportStatus;
  };
} 