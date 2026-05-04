import { Client } from '../../domain/entities/client';
import { Page, PaginationParams } from '../utils/pagination';

export interface IClientRepository {
  create(client: Client): Promise<void>;
  findAll(userId: number): Promise<Client[]>;
  findPage(userId: number, params: PaginationParams): Promise<Page<Client>>;
  findOne(id: number, userId: number): Promise<Client | null>;
  update(client: Client): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}
