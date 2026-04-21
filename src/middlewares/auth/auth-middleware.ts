import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { log } from '../../config/logger';
import prisma from '../../infrastructure/db/prisma';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  planId: number | null;
  isActive: boolean;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
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
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Always verify isActive from DB so disabling takes effect immediately
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isActive: true, role: true, planId: true },
    });

    if (!dbUser || !dbUser.isActive) {
      log.warn('Auth', `Conta desativada ou não encontrada: ${decoded.email}`);
      return res.status(403).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: dbUser.role,
      planId: dbUser.planId,
      isActive: dbUser.isActive,
    };
    next();
  } catch (err) {
    log.warn('Auth', `Token inválido ou expirado → ${req.method} ${req.path} (${(err as Error).message})`);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
