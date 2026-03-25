'use client';

import { useEffect, useRef, useState } from 'react';
import type { RestaurantBranchItem } from '@/lib/getRestaurantBranches';
import type { LangCode } from '@/types/i18n';
import { pickLocalized } from '@/types/i18n';

type YMapPlacemark = {
  events?: {
    add?: (name: string, callback: () => void) => void;
  };
};

type YMapInstance = {
  destroy: () => void;
  setCenter?: (center: [number, number], zoom?: number, options?: { duration?: number }) => void;
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
    options: { preset: string; iconColor?: string }
  ) => YMapPlacemark;
};

type WindowWithYMaps = Window & {
  ymaps?: YMapsApi;
};

export default function RestaurantsMap({
  branches,
  activeBranchId,
  lang,
  onSelectBranch,
}: {
  branches: RestaurantBranchItem[];
  activeBranchId?: string;
  lang: LangCode;
  onSelectBranch?: (branchId: string) => void;
}) {
  const mapRef = useRef<YMapInstance | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  const branchesWithCoordinates = branches.filter(
    (branch) => Array.isArray(branch.mapCoordinates) && branch.mapCoordinates.length === 2
  );
  const activeBranch =
    branchesWithCoordinates.find((branch) => branch.id === activeBranchId) || branchesWithCoordinates[0];

  useEffect(() => {
    let isCancelled = false;
    const scriptId = 'yandex-maps-api-script';

    const buildMap = () => {
      const windowWithYMaps = window as WindowWithYMaps;

      if (isCancelled || !mapContainerRef.current || !windowWithYMaps.ymaps || !activeBranch?.mapCoordinates) {
        return;
      }

      const ymaps = windowWithYMaps.ymaps;
      ymaps.ready(() => {
        if (isCancelled || !mapContainerRef.current || !activeBranch.mapCoordinates) return;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }

        const map = new ymaps.Map(
          mapContainerRef.current,
          {
            center: activeBranch.mapCoordinates,
            zoom: activeBranch.mapZoom || 15,
            controls: ['zoomControl'],
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

        for (const branch of branchesWithCoordinates) {
          if (!branch.mapCoordinates) continue;

          const placemark = new ymaps.Placemark(
            branch.mapCoordinates,
            {
              balloonContentHeader: pickLocalized(branch.branchName, lang),
              balloonContentBody: pickLocalized(branch.address, lang),
            },
            {
              preset:
                branch.id === activeBranch.id ? 'islands#redDotIcon' : 'islands#grayDotIcon',
              iconColor: branch.id === activeBranch.id ? '#AE0E16' : undefined,
            }
          );

          placemark.events?.add?.('click', () => {
            onSelectBranch?.(branch.id);
          });

          map.geoObjects.add(placemark);
        }

        mapRef.current = map;
      });
    };

    const onScriptError = () => {
      if (!isCancelled) {
        setMapLoadFailed(true);
      }
    };

    if ((window as WindowWithYMaps).ymaps) {
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
  }, [activeBranch, branchesWithCoordinates, lang, onSelectBranch]);

  if (!branchesWithCoordinates.length) {
    return (
      <div className="flex min-h-[440px] items-center justify-center border border-white/10 bg-card px-6 text-center text-[15px] leading-relaxed text-white/48 md:min-h-[620px]">
        Координаты филиалов появятся здесь после заполнения в Sanity.
      </div>
    );
  }

  if (!mapLoadFailed) {
    return (
      <div className="relative min-h-[440px] border border-white/10 bg-card md:min-h-[620px]">
        <div ref={mapContainerRef} className="h-full min-h-[440px] w-full md:min-h-[620px]" />
        {activeBranch?.mapLink ? (
          <a
            href={activeBranch.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 border border-white/20 bg-black/60 px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-white/90 transition-colors hover:bg-black/80"
          >
            {lang === 'ru' ? 'Открыть карту' : lang === 'en' ? 'Open map' : 'Xaritani ochish'}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-[440px] items-center justify-center border border-white/10 bg-card px-6 text-center text-[15px] leading-relaxed text-white/58 md:min-h-[620px]">
      <span>
        {lang === 'ru'
          ? 'Карта временно недоступна. Используйте адреса филиалов в списке.'
          : lang === 'en'
            ? 'Map is temporarily unavailable. Use branch addresses from the list.'
            : 'Xarita vaqtincha ishlamayapti. Filial manzillaridan foydalaning.'}
      </span>
    </div>
  );
}
