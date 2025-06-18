import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { CreateReportDto } from '../dto/create-report.dto';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  describe('parseDateTime', () => {
    it('debería parsear fecha y hora válidas correctamente', () => {
      const result = service.parseDateTime('15/12/2024', '14:30');
      
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDate()).toBe(15);
      expect(result?.getMonth()).toBe(11); // Enero es 0
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getHours()).toBe(14);
      expect(result?.getMinutes()).toBe(30);
    });

    it('debería retornar null para fecha inválida', () => {
      expect(service.parseDateTime('32/12/2024', '14:30')).toBeNull();
      expect(service.parseDateTime('15/13/2024', '14:30')).toBeNull();
      expect(service.parseDateTime('15/12/1999', '14:30')).toBeNull();
    });

    it('debería retornar null para hora inválida', () => {
      expect(service.parseDateTime('15/12/2024', '25:30')).toBeNull();
      expect(service.parseDateTime('15/12/2024', '14:60')).toBeNull();
      expect(service.parseDateTime('15/12/2024', '-1:30')).toBeNull();
    });

    it('debería retornar null para formato inválido', () => {
      expect(service.parseDateTime('15-12-2024', '14:30')).toBeNull();
      expect(service.parseDateTime('15/12/2024', '14-30')).toBeNull();
      expect(service.parseDateTime('invalid', 'invalid')).toBeNull();
    });
  });

  describe('sanitizeInputs', () => {
    it('debería sanitizar campos de texto correctamente', () => {
      const input: CreateReportDto = {
        phoneNumber: ' 3001234567 ',
        date: '15/12/2024',
        time: '14:30',
        description: ' <script>alert("xss")</script>Descripción válida ',
        hasEvidence: false,
        anonymous: false,
        reporterName: ' Juan Pérez & Co. ',
        reporterContact: ' 3009876543 ',
        termsAccepted: true,
      };

      const result = service.sanitizeInputs(input);

      expect(result.phoneNumber).toBe('3001234567');
      expect(result.description).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Descripción válida');
      expect(result.reporterName).toBe('Juan Pérez &amp; Co.');
      expect(result.reporterContact).toBe('3009876543');
    });

    it('debería manejar campos undefined correctamente', () => {
      const input: CreateReportDto = {
        phoneNumber: '3001234567',
        date: '15/12/2024',
        time: '14:30',
        description: 'Descripción válida',
        hasEvidence: false,
        anonymous: true,
        reporterName: undefined,
        reporterContact: undefined,
        termsAccepted: true,
      };

      const result = service.sanitizeInputs(input);

      expect(result.reporterName).toBeUndefined();
      expect(result.reporterContact).toBeUndefined();
    });
  });

  describe('validateColombianPhone', () => {
    it('debería validar números colombianos válidos', () => {
      expect(service.validateColombianPhone('3001234567')).toBe(true);
      expect(service.validateColombianPhone('+573001234567')).toBe(true);
      expect(service.validateColombianPhone('573001234567')).toBe(true);
      expect(service.validateColombianPhone('3201234567')).toBe(true);
    });

    it('debería rechazar números inválidos', () => {
      expect(service.validateColombianPhone('123456789')).toBe(false); // Muy corto
      expect(service.validateColombianPhone('0123456789')).toBe(false); // Empieza con 0
      expect(service.validateColombianPhone('12345678901')).toBe(false); // Muy largo
      expect(service.validateColombianPhone('abcdefghij')).toBe(false); // No numérico
      expect(service.validateColombianPhone('')).toBe(false); // Vacío
    });
  });

  describe('formatPhoneNumber', () => {
    it('debería formatear números correctamente', () => {
      expect(service.formatPhoneNumber('3001234567')).toBe('+573001234567');
      expect(service.formatPhoneNumber('573001234567')).toBe('+573001234567');
      expect(service.formatPhoneNumber('+573001234567')).toBe('+573001234567');
      expect(service.formatPhoneNumber(' 300 123 4567 ')).toBe('+573001234567');
    });

    it('debería retornar el número sin cambios si no coincide con el formato', () => {
      expect(service.formatPhoneNumber('123456789')).toBe('123456789');
      expect(service.formatPhoneNumber('invalid')).toBe('invalid');
    });
  });
}); 