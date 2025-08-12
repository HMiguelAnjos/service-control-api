export type ServiceDTO = {
  id: number | undefined,
  clientId: number,
  procedureId: number,
  description?: string | null;
  price: number;
  date: Date;
};
