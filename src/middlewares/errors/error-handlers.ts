import { Request, Response, NextFunction } from 'express';
import { BadRequest } from './bad-request';
import { log } from '../../config/logger';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof BadRequest) {
    // Erros de negócio esperados (4xx) — sem stack trace
    log.warn('ErrorHandler', `${req.method} ${req.path} → ${err.statusCode} ${err.message}`);
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Error) {
    // Erros inesperados (500) — loga com stack completa
    log.error('ErrorHandler', `${req.method} ${req.path} → 500`, err);
    return res.status(500).json({ error: err.message });
  }

  log.error('ErrorHandler', `${req.method} ${req.path} → 500 erro desconhecido`, err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
