
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DIFFICULTIES, REGIONS } from "@/types";

export default function ScheduleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const region = searchParams.get("region") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const date = searchParams.get("date") ?? "";

  function updateFilter(
    name: "region" | "difficulty" | "date",
    value: string
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    const query = params.toString();

    router.push(query ? `/schedules?${query}` : "/schedules");
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">
        산행 일정 검색
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="region"
            className="mb-2 block text-lg font-semibold"
          >
            지역
          </label>
          <select
            id="region"
            value={region}
            onChange={(event) =>
              updateFilter("region", event.target.value)
            }
            className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-lg"
          >
            <option value="">전체 지역</option>
            {Object.entries(REGIONS).map(([key,label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="mb-2 block text-lg font-semibold"
          >
            난이도
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(event) =>
              updateFilter("difficulty", event.target.value)
            }
            className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-lg"
          >
            <option value="">전체 난이도</option>
            {Object.entries(DIFFICULTIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="mb-2 block text-lg font-semibold"
          >
            산행 날짜
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) =>
              updateFilter("date", event.target.value)
            }
            className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-lg"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/schedules")}
        className="mt-5 min-h-12 rounded-lg border border-gray-300 bg-white px-5 text-lg font-semibold hover:bg-gray-100"
      >
        필터 초기화
      </button>
    </div>
  );
}
