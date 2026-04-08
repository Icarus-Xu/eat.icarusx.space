// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef } from 'react';
import { wgs84ToGcj02, gcj02ToWgs84 } from '@/app/lib/coords';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AMap: any;
    _AMapSecurityConfig: { securityJsCode: string };
  }
}

interface Props {
  lat: number;
  lng: number;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
}

export default function MapView({ lat, lng, onMapClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    window._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_JS_SECRET!,
    };

    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_JS_KEY}`;
    script.onload = () => {
      if (!containerRef.current) return;
      const gcj = wgs84ToGcj02(lat, lng);
      mapRef.current = new window.AMap.Map(containerRef.current, {
        center: [gcj.lng, gcj.lat],
        zoom: 15,
      });
      new window.AMap.Marker({ position: [gcj.lng, gcj.lat], map: mapRef.current });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapRef.current.on('click', (e: any) => {
        const wgs84 = gcj02ToWgs84(e.lnglat.getLat(), e.lnglat.getLng());
        onMapClickRef.current?.(wgs84);
      });
    };
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map center and marker when coords change
  useEffect(() => {
    if (!mapRef.current) return;
    const gcj = wgs84ToGcj02(lat, lng);
    const center = [gcj.lng, gcj.lat];
    mapRef.current.setCenter(center);
    mapRef.current.clearMap();
    new window.AMap.Marker({ position: center, map: mapRef.current });
  }, [lat, lng]);

  return <div ref={containerRef} className="h-full w-full" />;
}
