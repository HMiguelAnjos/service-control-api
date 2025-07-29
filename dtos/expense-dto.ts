export type ExpenseDTO = {
  id: string;
  serviceId: string;
  category: string;
  amount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null
};
