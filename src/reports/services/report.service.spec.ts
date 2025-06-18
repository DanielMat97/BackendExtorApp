import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ReportService } from './report.service';
import { ValidationService } from './validation.service';
import { Report, ReportStatus } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';

describe('ReportService', () => {
  let service: ReportService;
  let repository: Repository<Report>;
  let validationService: ValidationService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockValidationService = {
    parseDateTime: jest.fn(),
    sanitizeInputs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: getRepositoryToken(Report),
          useValue: mockRepository,
        },
        {
          provide: ValidationService,
          useValue: mockValidationService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    repository = module.get<Repository<Report>>(getRepositoryToken(Report));
    validationService = module.get<ValidationService>(ValidationService);
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

    const mockIncidentDate = new Date('2024-12-15T14:30:00');
    const mockSavedReport = {
      id: 'test-uuid',
      caseNumber: 'EXT-2024-000001',
      status: ReportStatus.PENDING,
      phoneNumber: mockCreateReportDto.phoneNumber,
      incidentDate: mockIncidentDate,
      description: mockCreateReportDto.description,
      hasEvidence: mockCreateReportDto.hasEvidence,
      isAnonymous: mockCreateReportDto.anonymous,
      reporterName: mockCreateReportDto.reporterName,
      reporterContact: mockCreateReportDto.reporterContact,
      termsAccepted: mockCreateReportDto.termsAccepted,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'test-agent',
    };

    it('debería crear un reporte exitosamente', async () => {
      // Arrange
      mockValidationService.parseDateTime.mockReturnValue(mockIncidentDate);
      mockValidationService.sanitizeInputs.mockReturnValue(mockCreateReportDto);
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.create.mockReturnValue(mockSavedReport);
      mockRepository.save.mockResolvedValue(mockSavedReport);

      // Act
      const result = await service.createReport(
        mockCreateReportDto,
        '192.168.1.1',
        'test-agent',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('exitosamente');
      expect(result.data.reportId).toBe(mockSavedReport.id);
      expect(result.data.caseNumber).toBe(mockSavedReport.caseNumber);
      expect(result.data.status).toBe(ReportStatus.PENDING);

      expect(mockValidationService.parseDateTime).toHaveBeenCalledWith(
        mockCreateReportDto.date,
        mockCreateReportDto.time,
      );
      expect(mockValidationService.sanitizeInputs).toHaveBeenCalledWith(mockCreateReportDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar error si la fecha es inválida', async () => {
      // Arrange
      mockValidationService.parseDateTime.mockReturnValue(null);

      // Act & Assert
      await expect(
        service.createReport(mockCreateReportDto, '192.168.1.1', 'test-agent'),
      ).rejects.toThrow(BadRequestException);

      expect(mockValidationService.parseDateTime).toHaveBeenCalledWith(
        mockCreateReportDto.date,
        mockCreateReportDto.time,
      );
    });

    it('debería lanzar error si la fecha es futura', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockValidationService.parseDateTime.mockReturnValue(futureDate);

      // Act & Assert
      await expect(
        service.createReport(mockCreateReportDto, '192.168.1.1', 'test-agent'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getReportById', () => {
    it('debería retornar un reporte por ID', async () => {
      // Arrange
      const mockReport = { id: 'test-id', caseNumber: 'EXT-2024-000001' };
      mockRepository.findOne.mockResolvedValue(mockReport);

      // Act
      const result = await service.getReportById('test-id');

      // Assert
      expect(result).toEqual(mockReport);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    });

    it('debería lanzar error si el reporte no existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getReportById('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getReportByCaseNumber', () => {
    it('debería retornar un reporte por número de caso', async () => {
      // Arrange
      const mockReport = { id: 'test-id', caseNumber: 'EXT-2024-000001' };
      mockRepository.findOne.mockResolvedValue(mockReport);

      // Act
      const result = await service.getReportByCaseNumber('EXT-2024-000001');

      // Assert
      expect(result).toEqual(mockReport);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { caseNumber: 'EXT-2024-000001' },
      });
    });

    it('debería lanzar error si el reporte no existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getReportByCaseNumber('NON-EXISTENT')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
}); 