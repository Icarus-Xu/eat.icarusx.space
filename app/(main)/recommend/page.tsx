// Copyright (C) 2026 Icarus. All rights reserved.
import type { Metadata } from 'next';
import RecommendClient from '@/app/ui/recommend/recommend-client';

export const metadata: Metadata = { title: 'Recommend' };

export default function RecommendPage() {
  return (
    <div>
      <h1 className="page-heading">What to eat today?</h1>
      <RecommendClient />
    </div>
  );
}
