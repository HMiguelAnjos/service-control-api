/**
 * Roles disponíveis no sistema.
 * Para adicionar um novo role, basta incluir aqui e tratar nas rotas/middlewares.
 */
export enum UserRole {
  User  = 'user',
  Admin = 'admin',
}

/**
 * Nomes dos planos cadastrados no banco via seed.
 * Para criar um novo plano, adicione o valor aqui e inclua no seed.ts.
 */
export enum PlanName {
  Gratis        = 'Grátis',
  Essencial     = 'Essencial',
  Profissional  = 'Profissional',
}
