import prisma from '../../../infrastructure/db/prisma';

export class GetDashboardUseCase {
  async execute(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [revenueAgg, expensesAgg, servicesThisMonth, topClients] = await Promise.all([
      prisma.service.aggregate({
        where: { userId, deletedAt: null },
        _sum: { totalPrice: true },
        _count: { id: true },
      }),

      prisma.expense.aggregate({
        where: { userId, deletedAt: null },
        _sum: { amount: true },
      }),

      prisma.service.count({
        where: { userId, deletedAt: null, date: { gte: startOfMonth, lte: endOfMonth } },
      }),

      prisma.service.groupBy({
        by: ['clientId'],
        where: { userId, deletedAt: null },
        _count: { id: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const totalRevenue = revenueAgg._sum.totalPrice?.toNumber() ?? 0;
    const totalExpenses = expensesAgg._sum.amount?.toNumber() ?? 0;
    const netProfit = totalRevenue - totalExpenses;
    const totalServices = revenueAgg._count.id ?? 0;

    const clientIds = topClients.map((c) => c.clientId);
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true },
    });
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalServices,
      servicesThisMonth,
      topClients: topClients.map((c) => ({
        id: c.clientId,
        name: clientMap.get(c.clientId) ?? 'Desconhecido',
        count: c._count?.id ?? 0,
        revenue: c._sum?.totalPrice?.toNumber() ?? 0,
      })),
    };
  }
}
