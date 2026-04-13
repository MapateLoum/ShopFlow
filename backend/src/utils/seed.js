require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || "loumpapamapate@gmail.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Papaloum2003";
  const name = "Super Admin";

  const exists = await prisma.superAdmin.findUnique({ where: { email } });
  if (exists) {
    console.log("✅ Super admin existe déjà :", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.superAdmin.create({ data: { name, email, passwordHash } });

  console.log("✅ Super admin créé !");
  console.log("   Email    :", email);
  console.log("   Password :", password);
  console.log("\n⚠️  Changez ce mot de passe en production !");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
