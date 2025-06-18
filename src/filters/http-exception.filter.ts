import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Log del error
    this.logger.error(
      `HTTP ${status} Error: ${exception.message}`,
      exception.stack,
      {
        path: request.url,
        method: request.method,
        ip: this.getClientIp(request),
        timestamp: new Date().toISOString(),
      },
    );

    // Respuesta personalizada para errores de validación
    if (status === HttpStatus.BAD_REQUEST) {
      const exceptionResponse = exception.getResponse() as any;
      
      if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
        const errors = exceptionResponse.message.map((msg: string) => ({
          field: this.extractFieldFromMessage(msg),
          message: msg,
        }));

        return response.status(status).json({
          success: false,
          message: 'Error de validación en los datos enviados',
          errors,
        });
      }
    }

    // Respuesta estándar para otros errores
    response.status(status).json({
      success: false,
      message: exception.message || 'Error interno del servidor',
      timestamp: new Date().toISOString(),
    });
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

  private extractFieldFromMessage(message: string): string {
    // Intentar extraer el campo del mensaje de error
    const match = message.match(/^(\w+)\s/);
    return match ? match[1] : 'unknown';
  }
} 