import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.client.createMany({
    data: [
      {
        name: "John Smith",
        primaryEmail: "john.smith@email.com",
        secondaryEmails: ["john.smith2@email.com", "jsmith.alt@email.com"],
      },
      {
        name: "Emma Johnson",
        primaryEmail: "emma.johnson@email.com",
        secondaryEmails: ["emma.j.alt@email.com"],
      },
      {
        name: "山田 太郎", // Yamada Tarou
        primaryEmail: "yamada.taro@email.jp",
        secondaryEmails: ["taro.yamada@email.jp", "yamadataro2@email.jp"],
      },
      {
        name: "佐藤 花子", // Satou Hanako
        primaryEmail: "sato.hanako@email.jp",
        secondaryEmails: ["hanako.sato@email.jp"],
      },
      {
        name: "Olivia Williams",
        primaryEmail: "olivia.williams@email.com",
        secondaryEmails: [],
      },
      {
        name: "鈴木 一郎", // Suzuki Ichirou
        primaryEmail: "suzuki.ichiro@email.jp",
        secondaryEmails: ["ichiro.suzuki@email.jp"],
      },
      {
        name: "Liam Brown",
        primaryEmail: "liam.brown@email.com",
        secondaryEmails: ["liam.brown2@email.com"],
      },
      {
        name: "高橋 美咲", // Takahashi Misaki
        primaryEmail: "takahashi.misaki@email.jp",
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
