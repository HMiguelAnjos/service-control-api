import { Request, Response, NextFunction } from 'express';
import { log } from '../../config/logger';

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    log.warn('Admin', `Acesso negado para ${req.user?.email} → ${req.method} ${req.path}`);
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
}
