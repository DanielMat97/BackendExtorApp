import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  ValidationPipe,
  Get,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { CreateReportResponseDto, ReportResponseDto } from '../dto/report-response.dto';

@Controller('reports')
@UseGuards(ThrottlerGuard)
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 reportes por minuto máximo
  async createReport(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) 
    createReportDto: CreateReportDto,
    @Req() request: Request,
  ): Promise<CreateReportResponseDto> {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('User-Agent') || 'unknown';

    return await this.reportService.createReport(
      createReportDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('case/:caseNumber')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 consultas por minuto
  async getReportByCaseNumber(
    @Param('caseNumber') caseNumber: string,
  ): Promise<ReportResponseDto> {
    try {
      const report = await this.reportService.getReportByCaseNumber(caseNumber);
      
      return {
        success: true,
        message: 'Reporte encontrado',
        data: {
          reportId: report.id,
          caseNumber: report.caseNumber,
          status: report.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Reporte no encontrado',
        errors: [
          {
            field: 'caseNumber',
            message: 'Número de caso inválido',
          },
        ],
      };
    }
  }

  @Get('status/:reportId')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 consultas por minuto
  async getReportStatus(
    @Param('reportId') reportId: string,
  ): Promise<ReportResponseDto> {
    try {
      const report = await this.reportService.getReportById(reportId);
      
      return {
        success: true,
        message: 'Estado del reporte obtenido',
        data: {
          reportId: report.id,
          caseNumber: report.caseNumber,
          status: report.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Reporte no encontrado',
        errors: [
          {
            field: 'reportId',
            message: 'ID de reporte inválido',
          },
        ],
      };
    }
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];
    
    return (
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(',')[0] ||
      (Array.isArray(xRealIp) ? xRealIp[0] : xRealIp) ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }
} 