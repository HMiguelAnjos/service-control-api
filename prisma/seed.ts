import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Grátis',
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
      name: 'Essencial',
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
      name: 'Profissional',
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
