// 시연 계정에 예약 내역 붙이기 (마이페이지 예약 내역·통계 그래프 시연용)
// 실행: npm run db:demo            → 가장 최근에 카카오·구글로 로그인한 회원에게 붙인다
//      npm run db:demo -- 3       → 회원 번호 3번에게 붙인다
// 로그인한 회원이 아직 없으면 "시연 계정"(DEMO)을 만들어 붙인다. 먼저 npm run db:seed를 실행해 둔다.
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { createPrismaClient } from "../lib/prisma-client";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const prisma = createPrismaClient();

// [일정 제목, 좌석 수, 예약 시각(산행 며칠 전)]
const PLAN: Array<[string, number, number]> = [
  ["황매산 철쭉 산행", 2, 10],
  ["덕유산 여름 계곡 산행", 1, 7],
  ["설악산 대청봉 무박 산행", 1, 14],
  ["월출산 천황봉 산행", 2, 9],
  ["주왕산 단풍 산행", 2, 20],
  ["계룡산 관음봉 산행", 1, 5],
  ["가지산 영남알프스 능선 산행", 2, 6], // 앞으로 갈 일정 (예약 내역·QR 확인용)
];

async function findTargetUser() {
  const idArg = process.argv[2];
  if (idArg) {
    const user = await prisma.user.findUnique({ where: { id: Number(idArg) } });
    if (!user) throw new Error(`회원 번호 ${idArg}번이 없습니다.`);
    return user;
  }

  const loggedIn = await prisma.user.findFirst({
    where: { provider: { in: ["KAKAO", "GOOGLE"] } },
    orderBy: { createdAt: "desc" },
  });
  if (loggedIn) return loggedIn;

  return prisma.user.upsert({
    where: { provider_providerId: { provider: "DEMO", providerId: "demo-hiker" } },
    update: {},
    create: { provider: "DEMO", providerId: "demo-hiker", name: "시연 계정" },
  });
}

async function main() {
  const user = await findTargetUser();

  // 다시 실행해도 같은 결과가 나오도록, 이 회원의 기존 예약을 먼저 지운다
  await prisma.reservation.deleteMany({ where: { userId: user.id } });

  for (const [title, seatCount, daysBefore] of PLAN) {
    const schedule = await prisma.schedule.findFirst({
      where: { title },
      include: { boardingPoints: { orderBy: { sortOrder: "asc" } }, seats: true },
    });
    if (!schedule) throw new Error(`"${title}" 일정이 없습니다. 먼저 npm run db:seed를 실행하세요.`);

    // 비어 있는 좌석 중 앞번호부터 고른다
    const taken = new Set(schedule.seats.map((seat) => seat.seatNumber));
    const freeSeats: number[] = [];
    for (let n = 1; n <= schedule.totalSeats && freeSeats.length < seatCount; n++) {
      if (!taken.has(n)) freeSeats.push(n);
    }
    if (freeSeats.length < seatCount) throw new Error(`"${title}" 일정에 빈 좌석이 부족합니다.`);

    const bookedAt = new Date(schedule.hikeDate);
    bookedAt.setDate(bookedAt.getDate() - daysBefore);
    const amount = schedule.price * seatCount;

    await prisma.reservation.create({
      data: {
        userId: user.id,
        scheduleId: schedule.id,
        boardingPointId: schedule.boardingPoints[0].id,
        status: "CONFIRMED",
        amount,
        createdAt: bookedAt,
        seats: {
          create: freeSeats.map((seatNumber) => ({ scheduleId: schedule.id, seatNumber })),
        },
        payment: {
          create: {
            orderId: `demo-${randomUUID()}`,
            paymentKey: `demo-${randomUUID()}`,
            amount,
            method: "카드",
            status: "DONE",
            approvedAt: bookedAt,
            createdAt: bookedAt,
          },
        },
      },
    });
  }

  console.log(`${user.name}(회원 번호 ${user.id})에게 예약 ${PLAN.length}건을 넣었습니다.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
