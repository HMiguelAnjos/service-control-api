import prisma from '../../../infrastructure/db/prisma';

export class GetDashboardUseCase {
  async execute(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [revenueAgg, expensesAgg, servicesThisMonth, topProcedures, topClients] = await Promise.all([
      prisma.service.aggregate({
        where: { userId, deletedAt: null },
        _sum: { price: true },
        _count: { id: true },
      }),

      prisma.expense.aggregate({
        where: { deletedAt: null, service: { userId, deletedAt: null } },
        _sum: { amount: true },
      }),

      prisma.service.count({
        where: { userId, deletedAt: null, date: { gte: startOfMonth, lte: endOfMonth } },
      }),

      prisma.service.groupBy({
        by: ['procedureId'],
        where: { userId, deletedAt: null },
        _count: { id: true },
        _sum: { price: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3,
      }),

      prisma.service.groupBy({
        by: ['clientId'],
        where: { userId, deletedAt: null },
        _count: { id: true },
        _sum: { price: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3,
      }),
    ]);

    const totalRevenue = revenueAgg._sum.price?.toNumber() ?? 0;
    const totalExpenses = expensesAgg._sum.amount?.toNumber() ?? 0;
    const netProfit = totalRevenue - totalExpenses;
    const totalServices = revenueAgg._count.id;

    const procedureIds = topProcedures.map((p) => p.procedureId);
    const clientIds = topClients.map((c) => c.clientId);

    const [procedures, clients] = await Promise.all([
      prisma.procedure_type.findMany({ where: { id: { in: procedureIds } }, select: { id: true, name: true } }),
      prisma.client.findMany({ where: { id: { in: clientIds } }, select: { id: true, name: true } }),
    ]);

    const procedureMap = new Map(procedures.map((p) => [p.id, p.name]));
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalServices,
      servicesThisMonth,
      topProcedures: topProcedures.map((p) => ({
        id: p.procedureId,
        name: procedureMap.get(p.procedureId) ?? 'Desconhecido',
        count: p._count.id,
        revenue: p._sum.price?.toNumber() ?? 0,
      })),
      topClients: topClients.map((c) => ({
        id: c.clientId,
        name: clientMap.get(c.clientId) ?? 'Desconhecido',
        count: c._count.id,
        revenue: c._sum.price?.toNumber() ?? 0,
      })),
    };
  }
}
