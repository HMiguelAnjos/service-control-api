import { Service } from '../../domain/entities/service';

export interface IServiceRepository {
  create(service: Service): Promise<Service>;
  findAll(userId: number): Promise<Service[]>;
  findOne(id: number, userId: number): Promise<Service | null>;
  findByClient(clientId: number, userId: number): Promise<Service[]>;
  update(service: Service): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}
