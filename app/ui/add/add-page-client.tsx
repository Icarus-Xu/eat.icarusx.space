// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState } from 'react';
import CollectForm from '@/app/ui/add/collect-form';
import RestaurantList from '@/app/ui/add/restaurant-list';
import { useT } from '@/app/ui/lang-context';

export default function AddPageClient() {
  const t = useT();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="page-heading">{t.addTitle}</h1>
        <CollectForm onSaved={() => setRefreshKey((k) => k + 1)} />
      </div>

      <div>
        <h2 className="section-heading">{t.addListTitle}</h2>
        <RestaurantList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
