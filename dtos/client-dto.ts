export type ClientDTO = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null
};
