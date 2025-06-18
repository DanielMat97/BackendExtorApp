import { Injectable } from '@nestjs/common';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ValidationService {
  parseDateTime(dateStr: string, timeStr: string): Date | null {
    try {
      // Parsear fecha DD/MM/AAAA
      const [day, month, year] = dateStr.split('/').map(Number);
      
      // Parsear hora HH:MM
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Validar valores
      if (
        day < 1 || day > 31 ||
        month < 1 || month > 12 ||
        year < 2000 || year > new Date().getFullYear() + 1 ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59
      ) {
        return null;
      }
      
      // Crear fecha
      const date = new Date(year, month - 1, day, hours, minutes);
      
      // Verificar que la fecha sea válida
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year ||
        date.getHours() !== hours ||
        date.getMinutes() !== minutes
      ) {
        return null;
      }
      
      return date;
    } catch (error) {
      return null;
    }
  }

  sanitizeInputs(dto: CreateReportDto): CreateReportDto {
    return {
      ...dto,
      phoneNumber: this.sanitizeString(dto.phoneNumber),
      description: this.sanitizeString(dto.description),
      reporterName: dto.reporterName ? this.sanitizeString(dto.reporterName) : undefined,
      reporterContact: dto.reporterContact ? this.sanitizeString(dto.reporterContact) : undefined,
      date: this.sanitizeString(dto.date),
      time: this.sanitizeString(dto.time),
    };
  }

  private sanitizeString(input: string): string {
    if (!input) return input;
    
    return input
      .trim()
      // Remover caracteres HTML potencialmente peligrosos
      .replace(/[<>\"'&]/g, (char) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;',
        };
        return entities[char] || char;
      })
      // Remover caracteres de control
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Limitar espacios múltiples
      .replace(/\s+/g, ' ');
  }

  validateColombianPhone(phoneNumber: string): boolean {
    // Formato: +57XXXXXXXXXX, 57XXXXXXXXXX, o XXXXXXXXXX (10 dígitos)
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
  }

  formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    if (cleanPhone.startsWith('+57')) {
      return cleanPhone;
    } else if (cleanPhone.startsWith('57') && cleanPhone.length === 12) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.length === 10) {
      return `+57${cleanPhone}`;
    }
    
    return cleanPhone;
  }
} 