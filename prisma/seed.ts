import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.client.createMany({
    data: [
      {
        name: "Matthew Nguyen",
        people: [],
        primaryEmail: "matthewnguyen1230@gmail.com",
        secondaryEmails: [],
      },
      {
        name: "Jacob Dirkx",
        people: [],
        primaryEmail: "jacobkdirkx@gmail.com",
        secondaryEmails: [],
      },
    ],
  });
}

main()
  .then(() => {
    console.log("Seed complete.");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });