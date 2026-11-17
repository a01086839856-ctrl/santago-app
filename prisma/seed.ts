// 초기 데이터 넣기 (DAR-001)  실행: npm run db:seed
// - 산행 일정·탑승지를 지우고 처음부터 다시 넣는다. 그 일정에 걸린 예약·좌석·결제도 같이 지워진다.
// - 앞으로 열릴 일정 5개 + 지난 일정 6개(마이페이지 통계 그래프용)
// - 좌표는 대략값이다. 지도 작업(SFR-008) 전에 카카오맵에서 확인해 고친다.
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type Difficulty,
  type Region,
} from "../generated/prisma/client";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type SeedSchedule = {
  title: string;
  mountain: string;
  region: Region;
  difficulty: Difficulty;
  hikeDate: string; // "YYYY-MM-DD"
  course: string;
  price: number;
  totalSeats: number;
  bookedSeats: number; // 다른 회원이 이미 예약한 좌석 수 (남은 좌석·마감 화면 확인용)
  firstBoardTime: string; // 첫 탑승 시각
  dest: { name: string; lat: number; lng: number };
};

// 부산 출발 탑승지 3곳. 첫 탑승 시각부터 20분 간격
const BUSAN_STOPS = [
  { name: "서면역", address: "부산 부산진구 서면역 일대", lat: 35.1579, lng: 129.0594 },
  { name: "동래역", address: "부산 동래구 동래역 일대", lat: 35.2052, lng: 129.0786 },
  { name: "덕천역", address: "부산 북구 덕천역 일대", lat: 35.2104, lng: 129.0056 },
];

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// 앞으로 열릴 일정 (목록·상세 화면용)
const UPCOMING: SeedSchedule[] = [
  {
    title: "지리산 천왕봉 당일 산행",
    mountain: "지리산",
    region: "GYEONGSANG",
    difficulty: "HARD",
    hikeDate: "2026-11-28",
    course: "중산리 탐방지원센터 → 로타리대피소 → 천왕봉 → 중산리 원점 회귀",
    price: 45000,
    totalSeats: 41,
    bookedSeats: 29,
    firstBoardTime: "05:30",
    dest: { name: "지리산 천왕봉", lat: 35.3369, lng: 127.7306 },
  },
  {
    title: "가지산 영남알프스 능선 산행",
    mountain: "가지산",
    region: "GYEONGSANG",
    difficulty: "NORMAL",
    hikeDate: "2026-11-29",
    course: "석남터널 → 가지산 정상 → 쌀바위 → 석남사",
    price: 30000,
    totalSeats: 41,
    bookedSeats: 16,
    firstBoardTime: "07:00",
    dest: { name: "가지산", lat: 35.617, lng: 129.003 },
  },
  {
    title: "덕유산 향적봉 눈꽃 산행",
    mountain: "덕유산",
    region: "JEOLLA",
    difficulty: "NORMAL",
    hikeDate: "2026-12-05",
    course: "무주리조트 → 설천봉 → 향적봉 → 중봉 → 원점 회귀",
    price: 40000,
    totalSeats: 28,
    bookedSeats: 25,
    firstBoardTime: "06:00",
    dest: { name: "덕유산 향적봉", lat: 35.8603, lng: 127.7461 },
  },
  {
    title: "속리산 문장대 산행",
    mountain: "속리산",
    region: "CHUNGCHEONG",
    difficulty: "NORMAL",
    hikeDate: "2026-12-06",
    course: "화북분소 → 문장대 → 신선대 → 법주사",
    price: 38000,
    totalSeats: 41,
    bookedSeats: 41, // 마감 표시 확인용
    firstBoardTime: "06:00",
    dest: { name: "속리산 문장대", lat: 36.5523, lng: 127.869 },
  },
  {
    title: "신불산 억새 평원 가벼운 산행",
    mountain: "신불산",
    region: "GYEONGSANG",
    difficulty: "EASY",
    hikeDate: "2026-12-12",
    course: "간월재 → 신불산 정상 → 신불재 → 원점 회귀",
    price: 25000,
    totalSeats: 28,
    bookedSeats: 8,
    firstBoardTime: "08:00",
    dest: { name: "신불산", lat: 35.5453, lng: 129.0378 },
  },
];

// 지난 일정 (시연 계정의 과거 예약과 통계 그래프용, 목록 화면에는 보이지 않게 거른다)
const PAST: SeedSchedule[] = [
  {
    title: "황매산 철쭉 산행",
    mountain: "황매산",
    region: "GYEONGSANG",
    difficulty: "EASY",
    hikeDate: "2026-06-20",
    course: "황매산 오토캠핑장 → 철쭉 군락지 → 황매산 정상",
    price: 25000,
    totalSeats: 41,
    bookedSeats: 30,
    firstBoardTime: "07:00",
    dest: { name: "황매산", lat: 35.487, lng: 127.981 },
  },
  {
    title: "덕유산 여름 계곡 산행",
    mountain: "덕유산",
    region: "JEOLLA",
    difficulty: "NORMAL",
    hikeDate: "2026-07-18",
    course: "구천동 탐방지원센터 → 구천동 계곡 → 백련사 → 원점 회귀",
    price: 40000,
    totalSeats: 28,
    bookedSeats: 20,
    firstBoardTime: "06:00",
    dest: { name: "덕유산 구천동", lat: 35.88, lng: 127.77 },
  },
  {
    title: "설악산 대청봉 무박 산행",
    mountain: "설악산",
    region: "GANGWON",
    difficulty: "HARD",
    hikeDate: "2026-08-22",
    course: "오색 → 대청봉 → 중청 → 희운각 → 설악동",
    price: 60000,
    totalSeats: 28,
    bookedSeats: 26,
    firstBoardTime: "21:00",
    dest: { name: "설악산 대청봉", lat: 38.1194, lng: 128.4653 },
  },
  {
    title: "월출산 천황봉 산행",
    mountain: "월출산",
    region: "JEOLLA",
    difficulty: "NORMAL",
    hikeDate: "2026-09-19",
    course: "천황사 → 구름다리 → 천황봉 → 도갑사",
    price: 38000,
    totalSeats: 41,
    bookedSeats: 22,
    firstBoardTime: "06:00",
    dest: { name: "월출산 천황봉", lat: 34.769, lng: 126.709 },
  },
  {
    title: "주왕산 단풍 산행",
    mountain: "주왕산",
    region: "GYEONGSANG",
    difficulty: "NORMAL",
    hikeDate: "2026-10-17",
    course: "대전사 → 용추폭포 → 절구폭포 → 원점 회귀",
    price: 35000,
    totalSeats: 41,
    bookedSeats: 39, // 시연 계정이 2석을 예약하면 마감
    firstBoardTime: "06:30",
    dest: { name: "주왕산", lat: 36.395, lng: 129.155 },
  },
  {
    title: "계룡산 관음봉 산행",
    mountain: "계룡산",
    region: "CHUNGCHEONG",
    difficulty: "NORMAL",
    hikeDate: "2026-10-31",
    course: "동학사 → 은선폭포 → 관음봉 → 남매탑 → 동학사",
    price: 40000,
    totalSeats: 41,
    bookedSeats: 18,
    firstBoardTime: "06:00",
    dest: { name: "계룡산 관음봉", lat: 36.343, lng: 127.205 },
  },
];

async function main() {
  // 1. 기존 일정과 거기 걸린 예약·좌석·결제를 지운다
  await prisma.payment.deleteMany();
  await prisma.reservationSeat.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.boardingPoint.deleteMany();
  await prisma.schedule.deleteMany();

  // 2. 좌석을 미리 채워 둘 "다른 회원" (테스트용)
  const filler = await prisma.user.upsert({
    where: { provider_providerId: { provider: "DEMO", providerId: "seed-other-members" } },
    update: {},
    create: { provider: "DEMO", providerId: "seed-other-members", name: "다른 회원(테스트)" },
  });

  // 3. 일정·탑승지를 넣고, 이미 팔린 좌석을 채운다
  for (const item of [...UPCOMING, ...PAST]) {
    const schedule = await prisma.schedule.create({
      data: {
        title: item.title,
        mountain: item.mountain,
        region: item.region,
        difficulty: item.difficulty,
        hikeDate: new Date(item.hikeDate),
        course: item.course,
        price: item.price,
        totalSeats: item.totalSeats,
        destName: item.dest.name,
        destLat: item.dest.lat,
        destLng: item.dest.lng,
        boardingPoints: {
          create: BUSAN_STOPS.map((stop, index) => ({
            ...stop,
            boardTime: addMinutes(item.firstBoardTime, index * 20),
            sortOrder: index + 1,
          })),
        },
      },
      include: { boardingPoints: true },
    });

    // 시연 계정이 고를 수 있게 앞쪽 좌석은 비워 두고, 뒤쪽 좌석부터 채운다
    if (item.bookedSeats > 0) {
      const seatNumbers = Array.from(
        { length: item.bookedSeats },
        (_, i) => item.totalSeats - i,
      );
      await prisma.reservation.create({
        data: {
          userId: filler.id,
          scheduleId: schedule.id,
          boardingPointId: schedule.boardingPoints[0].id,
          status: "CONFIRMED",
          amount: item.price * item.bookedSeats,
          seats: {
            create: seatNumbers.map((seatNumber) => ({
              scheduleId: schedule.id,
              seatNumber,
            })),
          },
        },
      });
    }
  }

  const total = await prisma.schedule.count();
  console.log(`초기 데이터 완료: 산행 일정 ${total}개 (앞으로 ${UPCOMING.length}개, 지난 일정 ${PAST.length}개)`);
  console.log("시연 계정 예약까지 넣으려면: npm run db:demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
