import { NextFunction, Request, Response } from 'express';
import prisma from '../../infrastructure/db/prisma';
import { PlanFeatureRequiredError } from '../errors/errors';

/**
 * Boolean plan features: caller passes the JSON key on `plan.features`
 * to gate (e.g. `photos`, `expenses`, `inventory`, `reports`).
 */
export type PlanFeatureKey = 'photos' | 'expenses' | 'inventory' | 'reports' | 'agenda';

interface PlanFeatures {
  maxClients?: number | null;
  maxServices?: number | null;
  photos?: boolean;
  expenses?: boolean;
  inventory?: boolean;
  reports?: boolean;
  agenda?: boolean;
}

const DEFAULT_FEATURES: PlanFeatures = {
  maxClients: 10,
  maxServices: 30,
  photos: false,
  expenses: false,
  inventory: false,
  reports: false,
  agenda: false,
};

// Process-level cache: plan rows change rarely (admin only) and reading them
// on every gated request is wasteful. TTL 60s is plenty.
const planCache = new Map<number, { features: PlanFeatures; cachedAt: number }>();
const CACHE_TTL_MS = 60 * 1000;

export async function getUserPlanFeatures(planId: number | null | undefined): Promise<PlanFeatures> {
  if (!planId) return DEFAULT_FEATURES;

  const cached = planCache.get(planId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.features;
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { features: true },
  });
  const features = (plan?.features ?? DEFAULT_FEATURES) as PlanFeatures;
  planCache.set(planId, { features, cachedAt: Date.now() });
  return features;
}

export function invalidatePlanCache(planId?: number): void {
  if (planId === undefined) planCache.clear();
  else planCache.delete(planId);
}

export function requirePlanFeature(feature: PlanFeatureKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Admins bypass plan gating entirely.
      if (req.user?.role === 'admin') return next();

      const features = await getUserPlanFeatures(req.user?.planId ?? null);
      if (!features[feature]) {
        return next(new PlanFeatureRequiredError(feature));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
