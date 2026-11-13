/*
  팀 공용 데이터 모양 (가안)

  - 화면(강도현)과 DB·API(윤태현)가 같은 모양으로 데이터를 주고받기 위한 약속이다.
  - DAR-001(DB 설계)에서 실제 테이블이 정해지면 이 파일도 함께 고친다.
  - 이 파일을 고칠 때는 상대에게 먼저 알린다.
*/

// 산행지 지역. 왼쪽 코드는 저장·필터용, 오른쪽 글자는 화면 표시용
export const REGIONS = {
  CAPITAL: "수도권",
  GANGWON: "강원",
  CHUNGCHEONG: "충청",
  JEOLLA: "전라",
  GYEONGSANG: "경상",
  JEJU: "제주",
} as const;
export type Region = keyof typeof REGIONS;

// 난이도. 왼쪽 코드는 저장·필터용, 오른쪽 글자는 화면 표시용
export const DIFFICULTIES = {
  EASY: "쉬움",
  NORMAL: "보통",
  HARD: "어려움",
} as const;
export type Difficulty = keyof typeof DIFFICULTIES;

// 탑승지: 버스를 타는 곳. 한 일정에 여러 곳이 있다.
export type BoardingPoint = {
  id: number;
  name: string; // 예: "서면역"
  address: string;
  time: string; // 탑승 시각, "06:00" 형식
  lat: number; // 위도 (지도 표시용)
  lng: number; // 경도 (지도 표시용)
};

// 산행 일정
export type Schedule = {
  id: number;
  title: string; // 예: "지리산 천왕봉 당일 산행"
  mountain: string; // 산 이름
  region: Region;
  difficulty: Difficulty;
  hikeDate: string; // 산행 날짜, "2026-12-05" 형식
  course: string; // 코스 설명
  price: number; // 1인 요금(원)
  totalSeats: number; // 버스 전체 좌석 수
  remainingSeats: number; // 남은 좌석 수. DB에서는 예약 수로 계산한다.
  destination: {
    name: string; // 산행지 이름 (지도 표시용)
    lat: number;
    lng: number;
  };
  boardingPoints: BoardingPoint[];
};
