import { IProfessionalRepository } from '../../ports/iprofessional-repository';
import { NotFoundError } from '../../../middlewares/errors/errors';

/**
 * Soft-delete a professional.  Services already registered against this
 * professional stay attached — their snapshot is immutable and the
 * commission was already paid according to the rule that was active
 * at the time.  Future draft services can no longer pick this pro.
 */
export class DeleteProfessionalUseCase {
  constructor(private repo: IProfessionalRepository) {}

  async execute(id: number, businessId: number): Promise<void> {
    const existing = await this.repo.findOne(id, businessId);
    if (!existing) throw new NotFoundError('Profissional');
    await this.repo.softDelete(id, businessId);
  }
}
