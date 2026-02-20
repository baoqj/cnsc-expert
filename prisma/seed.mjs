import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cnsc.local';
  const adminName = process.env.SEED_ADMIN_NAME || 'CNSC Admin';
  const orgName = process.env.SEED_ORG_NAME || 'CNSC Default Organization';
  const orgSlug = process.env.SEED_ORG_SLUG || slugify(orgName);

  const organization = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: { name: orgName },
    create: {
      slug: orgSlug,
      name: orgName,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: UserRole.ADMIN,
      orgId: organization.id,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: UserRole.ADMIN,
      orgId: organization.id,
    },
  });

  await prisma.subscription.upsert({
    where: { orgId: organization.id },
    update: {},
    create: {
      orgId: organization.id,
      plan: 'FREE',
      status: 'TRIALING',
    },
  });

  console.log(
    JSON.stringify(
      {
        seeded: true,
        adminUserId: user.id,
        adminEmail: user.email,
        organizationId: organization.id,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
