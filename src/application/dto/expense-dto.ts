export type ExpenseDTO = {
  id: number | undefined,
  serviceId: number,
  category: string;
  amount: number;
  notes?: string | null;
};
