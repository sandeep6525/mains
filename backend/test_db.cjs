const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Prisma Client Path:", require.resolve('@prisma/client'));
  
  // To get the resolved database URL from prisma internal config:
  const url = prisma._engineConfig?.env?.DATABASE_URL || prisma._engineConfig?.datasourceOverrides?.db;
  console.log("Datasource config:", prisma._engineConfig);
  
  const count = await prisma.pyqQuestion.count();
  console.log("PyqQuestion count:", count);
  
  await prisma.$disconnect();
}
main();
