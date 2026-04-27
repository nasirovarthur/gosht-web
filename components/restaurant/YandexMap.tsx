'use client';

import { useEffect, useRef, useState } from 'react';

type YMapInstance = {
  destroy: () => void;
  behaviors: {
    disable: (name: string) => void;
  };
  geoObjects: {
    add: (geoObject: unknown) => void;
  };
};

type YMapsApi = {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: { center: [number, number]; zoom: number; controls: string[] },
    options: { suppressMapOpenBlock: boolean; maxZoom: number }
  ) => YMapInstance;
  Placemark: new (
    coordinates: [number, number],
    properties: { balloonContentHeader: string; balloonContentBody: string },
    options: { preset: string }
  ) => unknown;
};

declare global {
  interface Window {
    ymaps?: YMapsApi;
  }
}

interface YandexMapProps {
  center: [number, number];
  branchName: string;
  address: string;
  mapLink: string;
  openMapLabel: string;
  height: string;
}

export default function YandexMap({
  center,
  branchName,
  address,
  mapLink,
  openMapLabel,
  height,
}: YandexMapProps) {
  const mapRef = useRef<YMapInstance | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  const [mapLat, mapLon] = center;

  useEffect(() => {
    let isCancelled = false;
    const scriptId = 'yandex-maps-api-script';

    const buildMap = () => {
      if (isCancelled || !mapContainerRef.current || !window.ymaps) return;
      const ymaps = window.ymaps;
      ymaps.ready(() => {
        if (isCancelled || !mapContainerRef.current) return;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }

        const map = new ymaps.Map(
          mapContainerRef.current,
          {
            center: [mapLat, mapLon],
            zoom: 15,
            controls: ['zoomControl', 'geolocationControl'],
          },
          {
            suppressMapOpenBlock: true,
            maxZoom: 18,
          }
        );

        map.behaviors.disable('scrollZoom');
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          map.behaviors.disable('drag');
        }

        const placemark = new ymaps.Placemark(
          [mapLat, mapLon],
          {
            balloonContentHeader: branchName,
            balloonContentBody: address,
          },
          {
            preset: 'islands#redDotIcon',
          }
        );

        map.geoObjects.add(placemark);
        mapRef.current = map;
      });
    };

    const onScriptError = () => {
      if (!isCancelled) {
        setMapLoadFailed(true);
      }
    };

    if (window.ymaps) {
      buildMap();
      return () => {
        isCancelled = true;
        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }
      };
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener('load', buildMap);
    script.addEventListener('error', onScriptError);

    return () => {
      isCancelled = true;
      script?.removeEventListener('load', buildMap);
      script?.removeEventListener('error', onScriptError);
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [mapLat, mapLon, address, branchName]);

  if (!mapLoadFailed) {
    return (
      <div className="w-full bg-card relative" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 bottom-4 px-4 py-2 text-ui text-primary border border-strong bg-panel hover:bg-card transition-colors"
        >
          {openMapLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="w-full bg-card flex items-center justify-center" style={{ height }}>
      <a
        href={mapLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-secondary transition-colors text-base lg:text-lg font-light border-b border-strong hover:border-[color:var(--text-secondary)] pb-1"
      >
        {openMapLabel}
      </a>
    </div>
  );
}
