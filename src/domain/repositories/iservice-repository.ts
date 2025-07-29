import { Service } from "../../domain/entities/service";

export interface IServiceRepository {
  create(service: Service): Promise<void>;
  findAll(): Promise<Service[]>;
  update(service: Service): Promise<void>;
  delete(id: string): Promise<void>;
}
