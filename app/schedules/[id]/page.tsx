import { notFound } from "next/navigation";
import { mockSchedules } from "@/lib/mock-data";

// SFR-002 산행 일정 상세 조회(코스·탑승지·잔여 좌석)
// 담당: 강도현 / 완료예정: 2026-11-20
// Next.js 16에서는 params가 Promise라서 await로 꺼내 쓴다.
export default async function ScheduleDetailPage({
  params,
}: PageProps<"/schedules/[id]">) {
  const { id } = await params;
  const schedule = mockSchedules.find((item) => item.id === Number(id));

  if (!schedule) {
    notFound();
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{schedule.title}</h1>
      <p className="text-gray-600">SFR-002 작업 예정 화면 (담당: 강도현)</p>
    </section>
  );
}
