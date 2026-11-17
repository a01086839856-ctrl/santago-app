// DB 연결 (서버 코드에서만 사용한다)
// 사용 예: import { prisma } from "@/lib/db";
//         const schedules = await prisma.schedule.findMany();
import { createPrismaClient } from "@/lib/prisma-client";

// 개발 중 코드가 바뀔 때마다 연결이 새로 생기지 않도록 하나만 만들어 재사용한다
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
