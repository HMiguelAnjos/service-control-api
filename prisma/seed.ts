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
        agenda: false,
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
        agenda: false,
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
        agenda: true,
      },
    },
  ];

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

  // Backfill: assign Professional plan to any user without a plan
  const professional = await prisma.plan.findUnique({ where: { name: PlanName.Professional } });
  if (professional) {
    const { count } = await prisma.user.updateMany({
      where: { planId: null },
      data: { planId: professional.id },
    });
    if (count > 0)
      console.log(`✓ Assigned Professional plan to ${count} existing user(s) with no plan`);
  }

  // ── Multi-tenant backfill ──────────────────────────────────────
  // For every user that doesn't yet have a business, create one, wire
  // the user to it, spawn a matching `professional` (linked to the user),
  // and set `businessId` on every existing owned record.  This makes
  // the migration to the business-scoped model non-breaking: legacy
  // code that filters by `userId` keeps working, new code can filter
  // by `businessId` immediately.
  const usersWithoutBusiness = await prisma.user.findMany({
    where: { businessId: null },
    select: { id: true, name: true, email: true },
  });

  for (const user of usersWithoutBusiness) {
    const business = await prisma.business.create({
      data: {
        name: user.name || `Business #${user.id}`,
        displayName: user.name,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    });

    // Ensure the user also has a `professional` record so services can
    // reference "who executed" even if no employees are configured.
    const existingProfessional = await prisma.professional.findUnique({
      where: { userId: user.id },
    });
    if (!existingProfessional) {
      await prisma.professional.create({
        data: {
          businessId: business.id,
          userId: user.id,
          name: user.name || user.email,
        },
      });
    }

    // Populate businessId on every owned record (idempotent — only touches nulls).
    await prisma.client.updateMany({
      where: { userId: user.id, businessId: null },
      data: { businessId: business.id },
    });
    await prisma.product.updateMany({
      where: { userId: user.id, businessId: null },
      data: { businessId: business.id },
    });
    await prisma.procedure_type.updateMany({
      where: { userId: user.id, businessId: null },
      data: { businessId: business.id },
    });
    await prisma.service.updateMany({
      where: { userId: user.id, businessId: null },
      data: { businessId: business.id },
    });
    await prisma.expense.updateMany({
      where: { userId: user.id, businessId: null },
      data: { businessId: business.id },
    });
    await prisma.appointment.updateMany({
      where: { userId: user.id, businessId: null },
      data: { businessId: business.id },
    });

    console.log(`✓ Business ${business.id} created for user ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
