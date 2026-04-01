// Copyright (C) 2026 Icarus. All rights reserved.
import type { Metadata } from 'next';
import AddPageClient from '@/app/ui/add/add-page-client';

export const metadata: Metadata = { title: 'Add' };

export default function AddPage() {
  return <AddPageClient />;
}
