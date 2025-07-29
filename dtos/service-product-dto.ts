export type ServiceProductDTO = {
  id: string;
  serviceId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null
};
