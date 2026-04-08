// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef } from 'react';
import { wgs84ToBd09, bd09ToGcj02, gcj02ToWgs84 } from '@/app/lib/coords';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BMapGL: any;
  }
}

interface Props {
  lat: number;
  lng: number;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
}

export default function BaiduMapView({ lat, lng, onMapClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const init = () => {
      if (!containerRef.current) return;
      const bd = wgs84ToBd09(lat, lng);
      const map = new window.BMapGL.Map(containerRef.current);
      const point = new window.BMapGL.Point(bd.lng, bd.lat);
      map.centerAndZoom(point, 16);
      map.enableScrollWheelZoom();
      map.addOverlay(new window.BMapGL.Marker(point));
      mapRef.current = map;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addEventListener('click', (e: any) => {
        const gcj02 = bd09ToGcj02(e.latlng.lat, e.latlng.lng);
        onMapClickRef.current?.(gcj02ToWgs84(gcj02.lat, gcj02.lng));
      });
    };

    if (window.BMapGL) {
      init();
      return;
    }

    const callbackName = `_bmap_init_${Date.now()}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[callbackName] = () => {
      init();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${process.env.NEXT_PUBLIC_BAIDU_MAP_AK}&callback=${callbackName}`;
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const bd = wgs84ToBd09(lat, lng);
    const point = new window.BMapGL.Point(bd.lng, bd.lat);
    mapRef.current.centerAndZoom(point, 16);
    mapRef.current.clearOverlays();
    mapRef.current.addOverlay(new window.BMapGL.Marker(point));
  }, [lat, lng]);

  return <div ref={containerRef} className="h-full w-full" />;
}
