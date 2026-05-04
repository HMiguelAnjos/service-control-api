import { Request, Response, NextFunction } from 'express';
import { DomainError } from './domain-error';
import { log } from '../../config/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof DomainError) {
    log.warn(
      'ErrorHandler',
      `${req.method} ${req.path} → ${err.statusCode} [${err.code}] ${err.message}`,
    );
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof Error) {
    log.error('ErrorHandler', `${req.method} ${req.path} → 500`, err);
    return res.status(500).json({ error: err.message, code: 'INTERNAL_ERROR' });
  }

  log.error('ErrorHandler', `${req.method} ${req.path} → 500 erro desconhecido`, err);
  return res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
}
