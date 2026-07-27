import { Professional } from '../../../domain/entities/professional';
import { IProfessionalRepository } from '../../ports/iprofessional-repository';
import { ConflictError, ValidationError } from '../../../middlewares/errors/errors';

export interface CreateProfessionalInput {
  businessId: number;
  name: string;
  userId?: number | null;
  hourlyCost?: number | null;
  initialCommissionPercent?: number | null;
}

export class CreateProfessionalUseCase {
  constructor(private repo: IProfessionalRepository) {}

  async execute(input: CreateProfessionalInput): Promise<Professional> {
    const entity = new Professional({
      businessId: input.businessId,
      name: input.name.trim(),
      userId: input.userId ?? null,
      hourlyCost: input.hourlyCost ?? null,
    });
    if (!entity.isValid()) throw new ValidationError('Dados do profissional inválidos.');

    // If a userId was supplied, guarantee it's not already linked to
    // another professional.
    if (input.userId != null) {
      const existing = await this.repo.findByUserId(input.userId);
      if (existing) {
        throw new ConflictError('Esse usuário já está vinculado a outro profissional.', {
          userId: input.userId,
          professionalId: existing.id,
        });
      }
    }

    const created = await this.repo.create(entity);

    if (input.initialCommissionPercent != null && created.id) {
      await this.repo.setCommissionPercent({
        professionalId: created.id,
        businessId: input.businessId,
        percent: input.initialCommissionPercent,
      });
    }
    return created;
  }
}
