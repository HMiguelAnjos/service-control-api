import { PrismaClient } from '@prisma/client';
import { PlanName } from '../src/domain/enums';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: PlanName.Gratis,
      description: 'Para começar a organizar seu negócio.',
      price: 0,
      features: {
        maxClients: 10,
        maxServices: 30,
        photos: false,
        expenses: false,
        inventory: false,
        reports: false,
      },
    },
    {
      name: PlanName.Essencial,
      description: 'Para profissionais em crescimento.',
      price: 49,
      features: {
        maxClients: 50,
        maxServices: null,
        photos: true,
        expenses: true,
        inventory: true,
        reports: false,
      },
    },
    {
      name: PlanName.Profissional,
      description: 'Tudo ilimitado para seu negócio crescer sem barreiras.',
      price: 99,
      features: {
        maxClients: null,
        maxServices: null,
        photos: true,
        expenses: true,
        inventory: true,
        reports: true,
      },
    },
    // Para adicionar um novo plano no futuro, basta incluir aqui e no enum PlanName:
    // {
    //   name: PlanName.Enterprise,
    //   description: '...',
    //   price: 199,
    //   features: { ... },
    // },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: { description: plan.description, price: plan.price, features: plan.features },
      create: plan,
    });
    console.log(`✓ Plano "${plan.name}" criado/atualizado`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
