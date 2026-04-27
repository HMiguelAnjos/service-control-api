import { NextFunction, Request, Response } from 'express';
import { PrismaUserRepository } from '../../infrastructure/db/prisma-user-repository';
import prisma from '../../infrastructure/db/prisma';
import { UserRole } from '../../domain/enums';

const userRepo = new PrismaUserRepository();

export class AdminController {
  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepo.findAll();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async listPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
      return res.json(plans);
    } catch (error) {
      next(error);
    }
  }

  async updateUserPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { planId } = req.body as { planId: number | null };
      await userRepo.updatePlan(id, planId ?? null);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { role } = req.body as { role: string };
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ error: `Role inválida. Use: ${Object.values(UserRole).join(', ')}.` });
      }
      await userRepo.updateRole(id, role);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updateUserActive(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { isActive } = req.body as { isActive: boolean };
      await userRepo.updateActive(id, !!isActive);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
