// Copyright (C) 2026 Icarus. All rights reserved.
import Image from 'next/image';

export default function AppLogo({ small }: { small?: boolean }) {
  const size = small ? 40 : 120;
  return (
    <Image
      src="/logo.png"
      alt="What to eat"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}
