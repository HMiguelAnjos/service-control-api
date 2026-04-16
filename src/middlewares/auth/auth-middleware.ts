import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { log } from '../../config/logger';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log.warn('Auth', `Token ausente → ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    log.error('Auth', 'JWT_SECRET não configurado');
    return res.status(500).json({ error: 'Configuração de autenticação ausente' });
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: number; email: string };
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    log.warn('Auth', `Token inválido ou expirado → ${req.method} ${req.path} (${(err as Error).message})`);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
