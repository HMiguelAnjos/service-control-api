export type InventoryDTO = {
  id: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null
};
