import { Client } from '../../domain/entities/client';

export interface IClientRepository {
  create(client: Client): Promise<void>;
  findAll(userId: number): Promise<Client[]>;
  findOne(id: number, userId: number): Promise<Client | null>;
  update(client: Client): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}
