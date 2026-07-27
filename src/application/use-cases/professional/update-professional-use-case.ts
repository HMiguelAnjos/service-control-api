import { Professional } from '../../../domain/entities/professional';
import {
  IProfessionalRepository,
  UpdateProfessionalInput,
} from '../../ports/iprofessional-repository';
import { ConflictError, ValidationError } from '../../../middlewares/errors/errors';

export interface UpdateProfessionalExecuteInput {
  id: number;
  businessId: number;
  patch: UpdateProfessionalInput;
}

export class UpdateProfessionalUseCase {
  constructor(private repo: IProfessionalRepository) {}

  async execute(input: UpdateProfessionalExecuteInput): Promise<Professional> {
    const { patch } = input;
    if (patch.name !== undefined && patch.name.trim().length === 0) {
      throw new ValidationError('Nome não pode ficar vazio.');
    }
    if (patch.hourlyCost !== undefined && patch.hourlyCost !== null && patch.hourlyCost < 0) {
      throw new ValidationError('Custo por hora não pode ser negativo.');
    }
    if (patch.userId != null) {
      const other = await this.repo.findByUserId(patch.userId);
      if (other && other.id !== input.id) {
        throw new ConflictError('Esse usuário já está vinculado a outro profissional.', {
          userId: patch.userId,
          professionalId: other.id,
        });
      }
    }
    return this.repo.update(input.id, input.businessId, patch);
  }
}
