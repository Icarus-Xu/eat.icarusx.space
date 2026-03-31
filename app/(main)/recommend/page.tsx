// Copyright (C) 2026 Icarus. All rights reserved.
import RecommendClient from '@/app/ui/recommend/recommend-client';

export default function RecommendPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-800">What to eat today?</h1>
      <RecommendClient />
    </div>
  );
}
