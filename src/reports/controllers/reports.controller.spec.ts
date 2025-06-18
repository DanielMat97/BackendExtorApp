import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ReportsController } from './reports.controller';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportStatus } from '../entities/report.entity';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportService;

  const mockReportService = {
    createReport: jest.fn(),
    getReportById: jest.fn(),
    getReportByCaseNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportService,
          useValue: mockReportService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportService>(ReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    const mockCreateReportDto: CreateReportDto = {
      phoneNumber: '3001234567',
      date: '15/12/2024',
      time: '14:30',
      description: 'Descripción de prueba del incidente de extorsión',
      hasEvidence: false,
      anonymous: false,
      reporterName: 'Juan Pérez',
      reporterContact: '3009876543',
      termsAccepted: true,
    };

    const mockRequest = {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'test-agent',
      },
      get: jest.fn().mockReturnValue('test-agent'),
      connection: { remoteAddress: '192.168.1.1' },
    } as any;

    const mockResponse = {
      success: true,
      message: 'Su reporte ha sido enviado exitosamente. Un oficial se pondrá en contacto con usted a la brevedad.',
      data: {
        reportId: 'test-uuid',
        caseNumber: 'EXT-2024-000001',
        status: ReportStatus.PENDING,
      },
    };

    it('debería crear un reporte exitosamente', async () => {
      // Arrange
      mockReportService.createReport.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createReport(mockCreateReportDto, mockRequest);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockReportService.createReport).toHaveBeenCalledWith(
        mockCreateReportDto,
        '192.168.1.1',
        'test-agent',
      );
    });

    it('debería extraer la IP correctamente', async () => {
      // Arrange
      const requestWithoutHeaders = {
        headers: {},
        get: jest.fn().mockReturnValue('test-agent'),
        connection: { remoteAddress: '127.0.0.1' },
      } as any;

      mockReportService.createReport.mockResolvedValue(mockResponse);

      // Act
      await controller.createReport(mockCreateReportDto, requestWithoutHeaders);

      // Assert
      expect(mockReportService.createReport).toHaveBeenCalledWith(
        mockCreateReportDto,
        '127.0.0.1',
        'test-agent',
      );
    });
  });

  describe('getReportByCaseNumber', () => {
    const mockReport = {
      id: 'test-uuid',
      caseNumber: 'EXT-2024-000001',
      status: ReportStatus.PENDING,
    };

    it('debería retornar un reporte por número de caso', async () => {
      // Arrange
      mockReportService.getReportByCaseNumber.mockResolvedValue(mockReport);

      // Act
      const result = await controller.getReportByCaseNumber('EXT-2024-000001');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reporte encontrado');
      expect(result.data).toEqual({
        reportId: mockReport.id,
        caseNumber: mockReport.caseNumber,
        status: mockReport.status,
      });
    });

    it('debería manejar errores cuando el reporte no existe', async () => {
      // Arrange
      mockReportService.getReportByCaseNumber.mockRejectedValue(new Error('Not found'));

      // Act
      const result = await controller.getReportByCaseNumber('NON-EXISTENT');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Reporte no encontrado');
      expect(result.errors).toEqual([
        {
          field: 'caseNumber',
          message: 'Número de caso inválido',
        },
      ]);
    });
  });

  describe('getReportStatus', () => {
    const mockReport = {
      id: 'test-uuid',
      caseNumber: 'EXT-2024-000001',
      status: ReportStatus.PENDING,
    };

    it('debería retornar el estado de un reporte por ID', async () => {
      // Arrange
      mockReportService.getReportById.mockResolvedValue(mockReport);

      // Act
      const result = await controller.getReportStatus('test-uuid');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Estado del reporte obtenido');
      expect(result.data).toEqual({
        reportId: mockReport.id,
        caseNumber: mockReport.caseNumber,
        status: mockReport.status,
      });
    });

    it('debería manejar errores cuando el reporte no existe', async () => {
      // Arrange
      mockReportService.getReportById.mockRejectedValue(new Error('Not found'));

      // Act
      const result = await controller.getReportStatus('non-existent-id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Reporte no encontrado');
      expect(result.errors).toEqual([
        {
          field: 'reportId',
          message: 'ID de reporte inválido',
        },
      ]);
    });
  });
}); 