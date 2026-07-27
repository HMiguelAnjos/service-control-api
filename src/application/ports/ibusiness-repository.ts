import { Business } from '../../domain/entities/business';

export interface UpdateBusinessInput {
  name?: string;
  displayName?: string | null;
  monthlyServiceEstimate?: number | null;
}

export interface IBusinessRepository {
  findById(id: number): Promise<Business | null>;
  update(id: number, patch: UpdateBusinessInput): Promise<Business>;
}
