
import KakaoMap from "@/components/KakaoMap";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchedule } from "@/lib/schedules";
import { DIFFICULTIES, REGIONS } from "@/types";

// SFR-002 산행 일정 상세 조회
// 담당: 강도현

export default async function ScheduleDetailPage({
  params,
}: PageProps<"/schedules/[id]">) {
  const { id } = await params;

  const scheduleId = Number(id);

  if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
    notFound();
  }

  const schedule = await getSchedule(scheduleId);

  if (!schedule) {
    notFound();
  }

  const soldOut = schedule.remainingSeats === 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/schedules"
        className="mb-8 inline-flex min-h-12 items-center text-lg font-semibold text-green-800 hover:underline"
      >
        ← 산행 일정 목록으로
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-green-100 px-3 py-2 text-lg font-semibold text-green-800">
            {REGIONS[schedule.region]}
          </span>

          <span className="rounded-lg bg-gray-100 px-3 py-2 text-lg text-gray-700">
            {DIFFICULTIES[schedule.difficulty]}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          {schedule.title}
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          {schedule.mountain} 산행 안내
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-2xl font-bold">
              산행 정보
            </h2>

            <dl className="space-y-4 text-lg">
              <div>
                <dt className="font-semibold text-gray-600">
                  산행 날짜
                </dt>
                <dd className="mt-1">{schedule.hikeDate}</dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600">
                  산행 코스
                </dt>
                <dd className="mt-1 leading-relaxed">
                  {schedule.course}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600">
                  산행 지역
                </dt>
                <dd className="mt-1">
                  {REGIONS[schedule.region]}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600">
                  난이도
                </dt>
                <dd className="mt-1">
                  {DIFFICULTIES[schedule.difficulty]}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-2xl font-bold">
              버스 탑승 장소
            </h2>

            <p className="mb-5 text-lg text-gray-600">
              원하는 탑승 장소와 출발 시간을 확인하세요.
            </p>

            <div className="mb-6">
              <KakaoMap points={schedule.boardingPoints} />
            </div>

            <ul className="space-y-4">
              {schedule.boardingPoints.map((point) => (
                <li
                  key={point.id}
                  className="rounded-xl bg-gray-50 p-4"
                >
                  <h3 className="text-xl font-bold">
                    {point.name}
                  </h3>

                  <p className="mt-2 text-lg">
                    출발 시간: {point.time}
                  </p>

                  <p className="mt-2 text-lg text-gray-600">
                    {point.address}
                  </p>

                  <a
                    href={`https://map.kakao.com/link/to/${encodeURIComponent(point.name)},${point.lat},${point.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-12 items-center text-lg font-semibold text-green-800 underline"
                  >
                    카카오맵 길찾기
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-6">
          <h2 className="mb-5 text-2xl font-bold">
            예약 정보
          </h2>

          <div className="space-y-4 text-lg">
            <div>
              <p className="text-gray-600">참가 비용</p>
              <p className="mt-1 text-2xl font-bold">
                {schedule.price.toLocaleString("ko-KR")}원
              </p>
            </div>

            <div>
              <p className="text-gray-600">전체 좌석</p>
              <p className="mt-1 font-semibold">
                {schedule.totalSeats}석
              </p>
            </div>

            <div>
              <p className="text-gray-600">남은 좌석</p>
              <p
                className={`mt-1 font-bold ${
                  soldOut ? "text-red-700" : "text-green-800"
                }`}
              >
                {soldOut
                  ? "예약 마감"
                  : `${schedule.remainingSeats}석`}
              </p>
            </div>
          </div>

          {soldOut ? (
            <div className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-gray-200 px-5 py-3 text-lg font-bold text-gray-600">
              예약 마감
            </div>
          ) : (
            <Link
              href={`/schedules/${schedule.id}/seats`}
              className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-lg font-bold text-white hover:bg-green-800"
            >
              좌석 선택하기
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
