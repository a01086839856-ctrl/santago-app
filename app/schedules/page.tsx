
import Link from "next/link";
import { Suspense } from "react";
import { getSchedules } from "@/lib/schedules";
import ScheduleFilters from "@/components/ScheduleFilters";
import { REGIONS, DIFFICULTIES } from "@/types";

// SFR-001 산행 일정 목록 및 필터
type SchedulesPageProps = {
  searchParams: Promise<{
    region?: string | string[];
    difficulty?: string | string[];
    date?: string | string[];
  }>;
};

export default async function SchedulesPage({
  searchParams,
}: SchedulesPageProps) {
  const params = await searchParams;

  // URL 검색 조건을 문자열로 변환
  const region =
    typeof params.region === "string" ? params.region : "";

  const difficulty =
    typeof params.difficulty === "string" ? params.difficulty : "";

  const date =
    typeof params.date === "string" ? params.date : "";

  // 선택한 조건에 맞는 산행 일정 조회
  const schedules = await getSchedules({
    region,
    difficulty,
    date,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          산행 일정 찾기
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          원하는 산행을 찾아 편안하게 버스로 떠나보세요.
        </p>
      </div>

      {/* 지역·난이도·날짜 필터 */}
      <div className="mb-8">
        <Suspense fallback={<p>검색 조건을 불러오는 중...</p>}>
          <ScheduleFilters />
        </Suspense>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          다가오는 산행
        </h2>

        <p className="mt-2 text-lg text-gray-600">
          총 {schedules.length}개의 산행 일정이 있습니다.
        </p>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-lg text-gray-600">
            선택한 조건에 맞는 산행 일정이 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {schedules.map((schedule) => {
            const soldOut = schedule.remainingSeats === 0;

            return (
              <article
                key={schedule.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-green-100 px-3 py-2 text-lg font-semibold text-green-800">
                    {REGIONS[schedule.region]}
                  </span>

                  <span className="rounded-lg bg-gray-100 px-3 py-2 text-lg text-gray-700">
                    {DIFFICULTIES[schedule.difficulty]}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  {schedule.title}
                </h3>

                <div className="mt-5 space-y-3 text-lg text-gray-700">
                  <p>산 이름: {schedule.mountain}</p>

                  <p>산행 날짜: {schedule.hikeDate}</p>

                  <p>
                    참가 비용:{" "}
                    {schedule.price.toLocaleString("ko-KR")}원
                  </p>

                  <p
                    className={
                      soldOut
                        ? "font-bold text-red-700"
                        : "font-bold text-green-800"
                    }
                  >
                    {soldOut
                      ? "예약 마감"
                      : `남은 좌석: ${schedule.remainingSeats}석`}
                  </p>
                </div>

                <Link
                  href={`/schedules/${schedule.id}`}
                  className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-lg font-bold text-white hover:bg-green-800"
                >
                  자세히 보기
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
