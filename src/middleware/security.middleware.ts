import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Log de auditoría de peticiones
    const clientIp = this.getClientIp(req);
    const userAgent = req.get('User-Agent') || 'unknown';
    const timestamp = new Date().toISOString();
    
    this.logger.log(`${req.method} ${req.originalUrl}`, {
      ip: clientIp,
      userAgent,
      timestamp,
      body: req.method === 'POST' ? '[REDACTED]' : undefined,
    });

    // Headers de seguridad adicionales
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
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