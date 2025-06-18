import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { CreateReportResponseDto } from '../dto/report-response.dto';
import { GetReportsResponseDto } from '../dto/get-reports.dto';
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

  async getAllReports(filters: {
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<GetReportsResponseDto> {
    try {
      const { page, limit, status, startDate, endDate } = filters;
      const skip = (page - 1) * limit;

      // Construir query con filtros
      const queryBuilder = this.reportRepository.createQueryBuilder('report');

      // Filtro por estado
      if (status) {
        queryBuilder.andWhere('report.status = :status', { status });
      }

      // Filtro por rango de fechas
      if (startDate) {
        const parsedStartDate = this.validationService.parseDateTime(startDate, '00:00');
        if (parsedStartDate) {
          queryBuilder.andWhere('report.incidentDate >= :startDate', { startDate: parsedStartDate });
        }
      }

      if (endDate) {
        const parsedEndDate = this.validationService.parseDateTime(endDate, '23:59');
        if (parsedEndDate) {
          queryBuilder.andWhere('report.incidentDate <= :endDate', { endDate: parsedEndDate });
        }  
      }

      // Ordenar por fecha de creación (más recientes primero)
      queryBuilder.orderBy('report.createdAt', 'DESC');

      // Obtener total de registros para paginación
      const total = await queryBuilder.getCount();

      // Aplicar paginación
      const reports = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      // Calcular información de paginación
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Mapear reportes para respuesta (sin exponer datos sensibles)
      const mappedReports = reports.map(report => ({
        id: report.id,
        caseNumber: report.caseNumber,
        phoneNumber: report.phoneNumber,
        incidentDate: report.incidentDate,
        description: report.description,
        hasEvidence: report.hasEvidence,
        isAnonymous: report.isAnonymous,
        status: report.status,
        createdAt: report.createdAt,
      }));

      // Log de auditoría
      this.logger.log(`Consulta de reportes realizada`, {
        page,
        limit,
        total,
        filters: { status, startDate, endDate },
        timestamp: new Date().toISOString(),
      });

      return {
        reports: mappedReports,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      this.logger.error(`Error al obtener reportes: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener los reportes');
    }
  }
} 