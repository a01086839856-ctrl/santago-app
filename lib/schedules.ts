
import { mockSchedules } from "@/lib/mock-data";
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

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayInKorea(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// 산행 일정 목록 조회
export async function getSchedules(
  filters: ScheduleFilters = {}
): Promise<Schedule[]> {
  const today = getTodayInKorea();

  return mockSchedules
    .filter((schedule) => {
      // 지난 일정 제외
      if (schedule.hikeDate < today) {
        return false;
      }

      // 지역 필터
      if (filters.region) {
        if (!isRegion(filters.region)) return false;
        if (schedule.region !== filters.region) return false;
      }

      // 난이도 필터
      if (filters.difficulty) {
        if (!isDifficulty(filters.difficulty)) return false;
        if (schedule.difficulty !== filters.difficulty) return false;
      }

      // 날짜 필터
      if (filters.date && schedule.hikeDate !== filters.date) {
        return false;
      }

      return true;
    })
    .sort((a, b) => a.hikeDate.localeCompare(b.hikeDate));
}

// 산행 일정 상세 조회
export async function getSchedule(
  id: number
): Promise<Schedule | null> {
  return mockSchedules.find((schedule) => schedule.id === id) ?? null;
}
