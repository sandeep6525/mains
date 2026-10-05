import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.FETCHIQ_ADMIN_EMAIL || 'admin@yuktiprep.com';
  const password = process.env.FETCHIQ_ADMIN_PASSWORD || 'admin123';
  
  const existingUser = await prisma.adminUser.findUnique({ where: { email } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin user ${email} already exists`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
