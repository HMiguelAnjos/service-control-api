import { Client } from "../../domain/entities/client";

export interface IClientRepository {
  create(client: Client): Promise<void>;
  findAll(): Promise<Client[]>;
  update(client: Client): Promise<void>;
  delete(id: number): Promise<void>;
}
