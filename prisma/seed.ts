// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create companies
  const acme = await prisma.client.create({
    data: {
      name: "Acme Corp",
      email: "contact@acme.com",
    },
  });

  const globex = await prisma.client.create({
    data: {
      name: "Globex Inc.",
      email: "info@globex.com",
    },
  });

  const stark = await prisma.client.create({
    data: {
      name: "Stark Industries",
      email: "hello@starkindustries.com",
    },
  });

  // Create some mail for Acme Corp
  await prisma.mail.create({
    data: {
      clientId: acme.id,
      imageUrls: [
        "https://placehold.co/200x300?text=Mail+1",
        "https://placehold.co/200x300?text=Mail+2"
      ],
      status: "pending",
      urgency: 2,
      notes: "Urgent delivery",
      receivedAt: new Date(),
    },
  });

  // Create some mail for Globex Inc.
  await prisma.mail.create({
    data: {
      clientId: globex.id,
      imageUrls: [
        "https://placehold.co/200x300?text=Mail+3"
      ],
      status: "notified",
      urgency: 1,
      notes: "Standard mail",
      receivedAt: new Date(),
    },
  });
}

main()
  .then(() => {
    console.log("Seed data created!");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
