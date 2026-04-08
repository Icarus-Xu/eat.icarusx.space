// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { gcj02ToWgs84, wgs84ToGcj02, bd09ToGcj02, wgs84ToBd09 } from '@/app/lib/coords';
import { useT } from '@/app/ui/lang-context';
import type { MapProvider } from '@/app/ui/map-provider-context';

interface Props {
  provider: MapProvider;
  initialCoords?: { lat: number; lng: number };
  onConfirm: (coords: { lat: number; lng: number }, address: string) => void;
  onClose: () => void;
}

export default function MapPickerModal({ provider, initialCoords, onConfirm, onClose }: Props) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const center = initialCoords ?? { lat: 39.9042, lng: 116.4074 };

    const onMapClick = async (wgs84: { lat: number; lng: number }) => {
      setSelected(wgs84);
      setSelectedAddress('');
      setLoadingAddress(true);
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${wgs84.lat}&lng=${wgs84.lng}&provider=${provider}`);
        const data = await res.json();
        if (data.address) setSelectedAddress(data.address);
      } finally {
        setLoadingAddress(false);
      }
    };

    if (provider === 'amap') {
      const initAmap = () => {
        if (!containerRef.current) return;
        window._AMapSecurityConfig = { securityJsCode: process.env.NEXT_PUBLIC_AMAP_JS_SECRET! };
        const gcj = wgs84ToGcj02(center.lat, center.lng);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = new window.AMap.Map(containerRef.current, { center: [gcj.lng, gcj.lat], zoom: 15 });
        mapRef.current = map;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.on('click', (e: any) => {
          const gcj02 = { lat: e.lnglat.getLat(), lng: e.lnglat.getLng() };
          const wgs84 = gcj02ToWgs84(gcj02.lat, gcj02.lng);
          if (markerRef.current) {
            markerRef.current.setPosition([gcj02.lng, gcj02.lat]);
          } else {
            markerRef.current = new window.AMap.Marker({ position: [gcj02.lng, gcj02.lat], map });
          }
          onMapClick(wgs84);
        });
      };
      if (window.AMap) initAmap();
      else {
        window._AMapSecurityConfig = { securityJsCode: process.env.NEXT_PUBLIC_AMAP_JS_SECRET! };
        const s = document.createElement('script');
        s.src = `https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_JS_KEY}`;
        s.onload = initAmap;
        document.head.appendChild(s);
      }
    } else {
      const initBaidu = () => {
        if (!containerRef.current) return;
        const bd = wgs84ToBd09(center.lat, center.lng);
        const map = new window.BMapGL.Map(containerRef.current);
        map.centerAndZoom(new window.BMapGL.Point(bd.lng, bd.lat), 15);
        map.enableScrollWheelZoom();
        mapRef.current = map;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.addEventListener('click', (e: any) => {
          const bd09 = { lat: e.latlng.lat, lng: e.latlng.lng };
          const wgs84 = gcj02ToWgs84(bd09ToGcj02(bd09.lat, bd09.lng).lat, bd09ToGcj02(bd09.lat, bd09.lng).lng);
          if (markerRef.current) map.removeOverlay(markerRef.current);
          const pt = new window.BMapGL.Point(bd09.lng, bd09.lat);
          markerRef.current = new window.BMapGL.Marker(pt);
          map.addOverlay(markerRef.current);
          onMapClick(wgs84);
        });
      };
      if (window.BMapGL) initBaidu();
      else {
        const cb = `_bmap_picker_${Date.now()}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)[cb] = () => { initBaidu(); delete (window as any)[cb]; };
        const s = document.createElement('script');
        s.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${process.env.NEXT_PUBLIC_BAIDU_MAP_AK}&callback=${cb}`;
        document.head.appendChild(s);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 className="font-medium text-gray-800 dark:text-gray-100">{t.locationPickerTitle}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 relative min-h-0">
        <div ref={containerRef} className="h-full w-full" />
        {!selected && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <span className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-300 shadow">
              {t.locationPickerHint}
            </span>
          </div>
        )}
      </div>

      {selected && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">
            {loadingAddress ? '…' : (selectedAddress || `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`)}
          </p>
          <button
            onClick={() => onConfirm(selected, selectedAddress)}
            disabled={loadingAddress}
            className="btn-primary shrink-0 disabled:opacity-50"
          >
            {t.locationGo}
          </button>
        </div>
      )}
    </div>
  );
}
