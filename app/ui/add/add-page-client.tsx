// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState } from 'react';
import CollectForm from '@/app/ui/add/collect-form';
import RestaurantList from '@/app/ui/add/restaurant-list';

export default function AddPageClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-6 text-xl font-semibold text-gray-800">Add a restaurant</h1>
        <CollectForm onSaved={() => setRefreshKey((k) => k + 1)} />
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-700">All restaurants</h2>
        <RestaurantList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
