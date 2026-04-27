import { PrismaClient } from '@prisma/client';
import { PlanName } from '../src/domain/enums';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: PlanName.Free,
      description: 'To start organizing your business.',
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
      name: PlanName.Essential,
      description: 'For growing professionals.',
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
      name: PlanName.Professional,
      description: 'Unlimited everything for your business to grow without limits.',
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
    // To add a new plan in the future, add it here and in the PlanName enum:
    // {
    //   name: PlanName.Enterprise,
    //   description: '...',
    //   price: 199,
    //   features: { ... },
    // },
  ];

  // Remove outdated plans and recreate to keep the DB in sync
  await prisma.plan.deleteMany({
    where: { name: { notIn: Object.values(PlanName) } },
  });

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: { description: plan.description, price: plan.price, features: plan.features },
      create: plan,
    });
    console.log(`✓ Plan "${plan.name}" created/updated`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
