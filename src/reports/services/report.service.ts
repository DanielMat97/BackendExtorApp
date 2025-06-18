import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { CreateReportResponseDto } from '../dto/report-response.dto';
import { ValidationService } from './validation.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly validationService: ValidationService,
  ) {}

  async createReport(
    createReportDto: CreateReportDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<CreateReportResponseDto> {
    try {
      // Validar y convertir fecha y hora
      const incidentDate = this.validationService.parseDateTime(
        createReportDto.date,
        createReportDto.time,
      );

      if (!incidentDate) {
        throw new BadRequestException('Fecha u hora inválida');
      }

      // Validar que la fecha no sea futura
      if (incidentDate > new Date()) {
        throw new BadRequestException('La fecha del incidente no puede ser futura');
      }

      // Sanitizar inputs
      const sanitizedData = this.validationService.sanitizeInputs(createReportDto);

      // Generar número de caso único
      const caseNumber = await this.generateCaseNumber();

      // Crear la entidad del reporte
      const report = this.reportRepository.create({
        phoneNumber: sanitizedData.phoneNumber,
        incidentDate,
        description: sanitizedData.description,
        hasEvidence: sanitizedData.hasEvidence || false,
        isAnonymous: sanitizedData.anonymous || false,
        reporterName: sanitizedData.anonymous ? null : sanitizedData.reporterName,
        reporterContact: sanitizedData.anonymous ? null : sanitizedData.reporterContact,
        termsAccepted: sanitizedData.termsAccepted,
        status: ReportStatus.PENDING,
        ipAddress,
        userAgent,
        caseNumber,
      });

      // Guardar en base de datos
      const savedReport = await this.reportRepository.save(report);

      // Log de auditoría
      this.logger.log(`Nuevo reporte creado: ${caseNumber}`, {
        reportId: savedReport.id,
        caseNumber,
        isAnonymous: savedReport.isAnonymous,
        ipAddress,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Su reporte ha sido enviado exitosamente. Un oficial se pondrá en contacto con usted a la brevedad.',
        data: {
          reportId: savedReport.id,
          caseNumber: savedReport.caseNumber,
          status: savedReport.status,
        },
      };
    } catch (error) {
      this.logger.error(`Error al crear reporte: ${error.message}`, error.stack, {
        ipAddress,
        timestamp: new Date().toISOString(),
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Error interno del servidor. Intente nuevamente.');
    }
  }

  private async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EXT-${year}`;
    
    // Buscar el último número de caso del año actual
    const lastReport = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.caseNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('report.caseNumber', 'DESC')
      .limit(1)
      .getOne();

    let nextNumber = 1;
    if (lastReport) {
      const lastNumber = parseInt(lastReport.caseNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
  }

  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new BadRequestException('Reporte no encontrado');
    }
    return report;
  }

  async getReportByCaseNumber(caseNumber: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { caseNumber } });
    if (!report) {
      throw new BadRequestException('Reporte no encontrado');
    }
    return report;
  }
} 