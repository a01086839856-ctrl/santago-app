// 산행 일정 데이터 가져오기 (SFR-001·002 화면이 사용)
// - 화면은 이 파일의 getSchedules(), getSchedule()만 부른다.
// - 처음에는 lib/mock-data.ts를 읽었고, 지금은 AWS RDS(PostgreSQL)를 읽는다.
//   함수 이름과 돌려주는 모양(types/index.ts의 Schedule)은 그대로라서 화면 코드는 바꾸지 않았다.
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { Difficulty, Region, Schedule } from "@/types";
import { DIFFICULTIES, REGIONS } from "@/types";

// 산행 일정 검색 조건
export type ScheduleFilters = {
  region?: string;
  difficulty?: string;
  date?: string;
};

// 지역 코드가 올바른지 확인
function isRegion(value: string): value is Region {
  return Object.prototype.hasOwnProperty.call(REGIONS, value);
}

// 난이도 코드가 올바른지 확인
function isDifficulty(value: string): value is Difficulty {
  return Object.prototype.hasOwnProperty.call(DIFFICULTIES, value);
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (한국 시간 기준)
function getTodayInKorea(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/*
  날짜 변환
  - DB의 산행 날짜(hikeDate)는 시간 없이 날짜만 저장한다(@db.Date).
  - Prisma는 이 값을 "그날 0시(UTC)"인 Date로 주고받는다.
  - 그래서 "2026-12-05" ↔ 2026-12-05T00:00:00Z 로 바꾸면 하루가 밀리지 않는다.
*/
function toDbDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function fromDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// 일정과 함께 가져올 것: 탑승지(탑승 순서대로), 예약된 좌석 줄 수
const scheduleInclude = {
  boardingPoints: { orderBy: { sortOrder: "asc" } },
  _count: { select: { seats: true } },
} satisfies Prisma.ScheduleInclude;

type ScheduleRow = Prisma.ScheduleGetPayload<{
  include: typeof scheduleInclude;
}>;

// DB 한 줄을 화면이 쓰는 Schedule 모양으로 바꾼다
function toSchedule(row: ScheduleRow): Schedule {
  return {
    id: row.id,
    title: row.title,
    mountain: row.mountain,
    region: row.region,
    difficulty: row.difficulty,
    hikeDate: fromDbDate(row.hikeDate),
    course: row.course,
    price: row.price,
    totalSeats: row.totalSeats,
    // 남은 좌석은 저장하지 않고 계산한다: 전체 좌석 - 예약된 좌석 줄 수
    remainingSeats: Math.max(row.totalSeats - row._count.seats, 0),
    destination: {
      name: row.destName,
      lat: row.destLat,
      lng: row.destLng,
    },
    boardingPoints: row.boardingPoints.map((point) => ({
      id: point.id,
      name: point.name,
      address: point.address,
      time: point.boardTime,
      lat: point.lat,
      lng: point.lng,
    })),
  };
}

// 산행 일정 목록 조회 (오늘 이후 일정만, 날짜가 빠른 순)
export async function getSchedules(
  filters: ScheduleFilters = {}
): Promise<Schedule[]> {
  // 지난 일정 제외: 산행 날짜 >= 오늘
  const hikeDate: Prisma.DateTimeFilter = {
    gte: new Date(`${getTodayInKorea()}T00:00:00.000Z`),
  };
  const where: Prisma.ScheduleWhereInput = { hikeDate };

  // 지역 필터: 없는 코드가 들어오면 결과 없음
  if (filters.region) {
    if (!isRegion(filters.region)) return [];
    where.region = filters.region;
  }

  // 난이도 필터: 없는 코드가 들어오면 결과 없음
  if (filters.difficulty) {
    if (!isDifficulty(filters.difficulty)) return [];
    where.difficulty = filters.difficulty;
  }

  // 날짜 필터: 형식이 틀리면 결과 없음. 위의 "오늘 이후" 조건과 함께 적용된다
  if (filters.date) {
    const date = toDbDate(filters.date);
    if (!date) return [];
    hikeDate.equals = date;
  }

  const rows = await prisma.schedule.findMany({
    where,
    include: scheduleInclude,
    orderBy: [{ hikeDate: "asc" }, { id: "asc" }],
  });

  return rows.map(toSchedule);
}

// 산행 일정 상세 조회 (없는 번호면 null → 화면에서 404)
// 지난 일정도 돌려준다. 예약 내역(SFR-005)에서 지난 산행을 열어 볼 수 있게 하기 위해서다.
export async function getSchedule(
  id: number
): Promise<Schedule | null> {
  const row = await prisma.schedule.findUnique({
    where: { id },
    include: scheduleInclude,
  });

  return row ? toSchedule(row) : null;
}
