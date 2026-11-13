import Link from "next/link";
import { mockSchedules } from "@/lib/mock-data";

// SFR-001 산행 일정 목록 조회(지역·난이도·날짜 필터)
// 담당: 강도현 / 완료예정: 2026-11-20
// 지금은 자리만 잡아 둔 화면이다. 목업 데이터로 카드 목록과 필터를 만든 뒤, DB가 준비되면 실제 조회로 바꾼다.
export default function SchedulesPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">산행 일정</h1>
      <p className="text-gray-600">SFR-001 작업 예정 화면 (담당: 강도현)</p>
      <ul className="flex flex-col gap-2">
        {mockSchedules.map((schedule) => (
          <li key={schedule.id}>
            <Link href={`/schedules/${schedule.id}`} className="underline">
              {schedule.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
