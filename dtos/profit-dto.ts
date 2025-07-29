export type ProfitDTO = {
  id: string;
  serviceId: string;
  totalProfit: number;
  marginPct: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null
};
