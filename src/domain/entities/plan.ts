export interface PlanFeatures {
  maxClients: number | null;
  maxServices: number | null;
  photos: boolean;
  expenses: boolean;
  inventory: boolean;
  reports: boolean;
}

export class Plan {
  constructor(
    public readonly id: number | undefined,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly price: number,
    public readonly features: PlanFeatures,
    public readonly isActive: boolean = true,
  ) {}
}
