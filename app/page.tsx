import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-col items-start gap-4 py-10">
      <h1 className="text-3xl font-bold">산행 버스, 좌석까지 한 번에</h1>
      <p className="text-gray-600">
        가고 싶은 산행 일정을 고르고, 탑승지와 좌석을 정해 예약하세요.
      </p>
      <Link
        href="/schedules"
        className="flex min-h-12 items-center rounded-lg bg-green-700 px-6 font-semibold text-white hover:bg-green-800"
      >
        산행 일정 보기
      </Link>
    </section>
  );
}
