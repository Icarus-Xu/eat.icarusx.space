// Copyright (C) 2026 Icarus. All rights reserved.

const X_PI = (Math.PI * 3000.0) / 180.0;

// BD-09 -> GCJ-02
export function bd09ToGcj02(lat: number, lng: number): { lat: number; lng: number } {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  return { lat: z * Math.sin(theta), lng: z * Math.cos(theta) };
}
