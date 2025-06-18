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

export class GetAllReportsResponseDto {
  success: boolean;
  message: string;
  data: {
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
  };
} 