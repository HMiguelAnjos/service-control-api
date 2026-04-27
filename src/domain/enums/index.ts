/**
 * Available user roles in the system.
 * To add a new role, add it here and handle it in the routes/middlewares.
 */
export enum UserRole {
  User  = 'user',
  Admin = 'admin',
}

/**
 * Plan names as stored in the database (seeded via prisma/seed.ts).
 * To add a new plan, add it here and include it in seed.ts.
 */
export enum PlanName {
  Free         = 'Free',
  Essential    = 'Essential',
  Professional = 'Professional',
}
