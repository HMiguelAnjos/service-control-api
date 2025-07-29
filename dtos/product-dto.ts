export type ProductDTO = {
  id: string;
  name: string;
  description?: string;
  unitCost: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null
};
