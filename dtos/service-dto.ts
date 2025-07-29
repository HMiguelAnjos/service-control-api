export type ServiceDTO = {
  id: string;
  clientId: string;
  procedureId: string;
  description?: string;
  price: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null
};
