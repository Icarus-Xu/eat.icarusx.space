// Copyright (C) 2026 Icarus. All rights reserved.
import Image from 'next/image';

export default function AppLogo() {
  return (
    <Image
      src="/logo.png"
      alt="What to eat"
      width={120}
      height={120}
      className="object-contain"
    />
  );
}
