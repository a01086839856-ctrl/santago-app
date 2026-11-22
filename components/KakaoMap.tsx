
"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type BoardingPoint = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  points: BoardingPoint[];
};

type KakaoLatLng = object;
type KakaoMapInstance = object;

type KakaoMaps = {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;

  LatLngBounds: new () => {
    extend: (position: KakaoLatLng) => void;
  };

  Map: new (
    element: HTMLElement,
    options: {
      center: KakaoLatLng;
      level: number;
    }
  ) => KakaoMapInstance & {
    setBounds: (
      bounds: InstanceType<KakaoMaps["LatLngBounds"]>,
      padding?: number
    ) => void;
  };

  Marker: new (options: {
    position: KakaoLatLng;
    map: KakaoMapInstance;
    title?: string;
  }) => object;

  InfoWindow: new (options: {
    content: string;
    removable?: boolean;
  }) => {
    open: (map: KakaoMapInstance, marker: object) => void;
    close: () => void;
  };

  event: {
    addListener: (
      target: object,
      eventName: string,
      handler: () => void
    ) => void;
  };

  load: (callback: () => void) => void;
};

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMaps;
    };
  }
}

export default function KakaoMap({ points }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY;

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.kakao || !points.length) {
      return;
    }

    let cancelled = false;
    const maps = window.kakao.maps;

    maps.load(() => {
      if (cancelled || !mapRef.current) return;

      const first = points[0];

      const map = new maps.Map(mapRef.current, {
        center: new maps.LatLng(first.lat, first.lng),
        level: 5,
      });

      const bounds = new maps.LatLngBounds();

      let openedInfoWindow:
        | InstanceType<KakaoMaps["InfoWindow"]>
        | null = null;

      points.forEach((point) => {
        const position = new maps.LatLng(point.lat, point.lng);

        const marker = new maps.Marker({
          map,
          position,
          title: point.name,
        });

        bounds.extend(position);

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="
              padding:10px 14px;
              font-size:14px;
              font-weight:600;
              white-space:nowrap;
              color:#111827;
            ">
              ${escapeHtml(point.name)}
            </div>
          `,
          removable: true,
        });

        maps.event.addListener(marker, "click", () => {
          if (openedInfoWindow) {
            openedInfoWindow.close();
          }

          infoWindow.open(map, marker);
          openedInfoWindow = infoWindow;
        });
      });

      // 모든 탑승 장소가 보이도록 지도 범위 자동 조정
      if (points.length > 1) {
        map.setBounds(bounds, 50);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loaded, points]);

  if (!apiKey) {
    return (
      <p className="text-red-700">
        카카오맵 JavaScript 키가 설정되지 않았습니다.
      </p>
    );
  }

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`}
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
        onError={() => console.error("카카오맵 SDK 로드 실패")}
      />

      <div
        ref={mapRef}
        className="h-[350px] w-full rounded-xl"
        aria-label="버스 탑승 장소 지도"
      />
    </>
  );
}

// 장소 이름을 HTML에 안전하게 표시하기 위한 함수
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}
