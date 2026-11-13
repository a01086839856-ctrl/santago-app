import type { BoardingPoint, Schedule } from "@/types";

/*
  DB 연결 전 화면 작업용 임시 데이터

  - SFR-001·002 화면을 먼저 만들 때 쓴다. DB가 준비되면 실제 조회로 바꾸고 이 파일은 지운다.
  - 실제 초기 데이터(시드)는 DAR-001(윤태현)에서 따로 만든다.
  - 좌표는 대략값이다. 지도 작업(SFR-008) 전에 카카오맵에서 확인해 고친다.
*/

// 부산 출발 탑승지 3곳. 첫 탑승 시각만 일정마다 다르고, 20분 간격으로 돈다.
function busanBoardingPoints(firstTime: string, idStart: number): BoardingPoint[] {
  const [hour, minute] = firstTime.split(":").map(Number);
  const at = (addMinutes: number) => {
    const total = hour * 60 + minute + addMinutes;
    const h = String(Math.floor(total / 60)).padStart(2, "0");
    const m = String(total % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  return [
    { id: idStart, name: "서면역", address: "부산 부산진구 서면역 일대", time: at(0), lat: 35.1579, lng: 129.0594 },
    { id: idStart + 1, name: "동래역", address: "부산 동래구 동래역 일대", time: at(20), lat: 35.2052, lng: 129.0786 },
    { id: idStart + 2, name: "덕천역", address: "부산 북구 덕천역 일대", time: at(40), lat: 35.2104, lng: 129.0056 },
  ];
}

export const mockSchedules: Schedule[] = [
  {
    id: 1,
    title: "지리산 천왕봉 당일 산행",
    mountain: "지리산",
    region: "GYEONGSANG",
    difficulty: "HARD",
    hikeDate: "2026-11-28",
    course: "중산리 탐방지원센터 → 로타리대피소 → 천왕봉 → 중산리 원점 회귀",
    price: 45000,
    totalSeats: 41,
    remainingSeats: 12,
    destination: { name: "지리산 천왕봉", lat: 35.3369, lng: 127.7306 },
    boardingPoints: busanBoardingPoints("05:30", 1),
  },
  {
    id: 2,
    title: "가지산 영남알프스 능선 산행",
    mountain: "가지산",
    region: "GYEONGSANG",
    difficulty: "NORMAL",
    hikeDate: "2026-11-29",
    course: "석남터널 → 가지산 정상 → 쌀바위 → 석남사",
    price: 30000,
    totalSeats: 41,
    remainingSeats: 25,
    destination: { name: "가지산", lat: 35.617, lng: 129.003 },
    boardingPoints: busanBoardingPoints("07:00", 4),
  },
  {
    id: 3,
    title: "덕유산 향적봉 눈꽃 산행",
    mountain: "덕유산",
    region: "JEOLLA",
    difficulty: "NORMAL",
    hikeDate: "2026-12-05",
    course: "무주리조트 → 설천봉 → 향적봉 → 중봉 → 원점 회귀",
    price: 40000,
    totalSeats: 28,
    remainingSeats: 3,
    destination: { name: "덕유산 향적봉", lat: 35.8603, lng: 127.7461 },
    boardingPoints: busanBoardingPoints("06:00", 7),
  },
  {
    id: 4,
    title: "속리산 문장대 산행",
    mountain: "속리산",
    region: "CHUNGCHEONG",
    difficulty: "NORMAL",
    hikeDate: "2026-12-06",
    course: "화북분소 → 문장대 → 신선대 → 법주사",
    price: 38000,
    totalSeats: 41,
    remainingSeats: 0,
    destination: { name: "속리산 문장대", lat: 36.5523, lng: 127.869 },
    boardingPoints: busanBoardingPoints("06:00", 10),
  },
  {
    id: 5,
    title: "신불산 억새 평원 가벼운 산행",
    mountain: "신불산",
    region: "GYEONGSANG",
    difficulty: "EASY",
    hikeDate: "2026-12-12",
    course: "간월재 → 신불산 정상 → 신불재 → 원점 회귀",
    price: 25000,
    totalSeats: 28,
    remainingSeats: 20,
    destination: { name: "신불산", lat: 35.5453, lng: 129.0378 },
    boardingPoints: busanBoardingPoints("08:00", 13),
  },
];
