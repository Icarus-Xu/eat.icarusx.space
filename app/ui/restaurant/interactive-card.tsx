// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';
import RestaurantModal, { type ModalMode } from '@/app/ui/restaurant/restaurant-modal';

interface Props {
  restaurantId: string;
  amapPoiId: string | null;
  baiduPoiId: string | null;
  distanceM: number | null;
  onChanged?: () => void;
  className?: string;
  children: React.ReactNode;
}

const MENU_WIDTH = 190;
const MENU_HEIGHT = 148;
const LONG_PRESS_MS = 500;

export default function InteractiveCard({
  restaurantId,
  amapPoiId,
  baiduPoiId,
  distanceM,
  onChanged,
  className,
  children,
}: Props) {
  const t = useT();
  const { provider } = useMapProvider();

  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode }>({ open: false, mode: 'detail' });
  const [menu, setMenu] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });

  const longPressTimer = useRef<number | undefined>(undefined);
  const longPressFired = useRef(false);

  const effectiveProvider = provider ?? 'amap';
  const navHref =
    effectiveProvider === 'baidu' && baiduPoiId
      ? `https://map.baidu.com/?uid=${baiduPoiId}`
      : amapPoiId
        ? `https://ditu.amap.com/place/${amapPoiId}`
        : baiduPoiId
          ? `https://map.baidu.com/?uid=${baiduPoiId}`
          : null;

  const openMenu = (x: number, y: number) => {
    const clampedX = Math.min(x, window.innerWidth - MENU_WIDTH - 8);
    const clampedY = Math.min(y, window.innerHeight - MENU_HEIGHT - 8);
    setMenu({ open: true, x: Math.max(8, clampedX), y: Math.max(8, clampedY) });
  };
  const closeMenu = () => setMenu((m) => ({ ...m, open: false }));

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  };

  // Close the context menu on scroll / resize
  useEffect(() => {
    if (!menu.open) return;
    const close = () => closeMenu();
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menu.open]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    clearLongPress();
    openMenu(e.clientX, e.clientY);
  };

  const handleClick = () => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    setModal({ open: true, mode: 'detail' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setModal({ open: true, mode: 'detail' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    longPressFired.current = false;
    const touch = e.touches[0];
    const { clientX, clientY } = touch;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      openMenu(clientX, clientY);
    }, LONG_PRESS_MS);
  };

  const navigate = () => {
    if (navHref) window.open(navHref, '_blank', 'noopener,noreferrer');
    closeMenu();
  };

  const openModal = (mode: ModalMode) => {
    closeMenu();
    setModal({ open: true, mode });
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={`${className ?? ''} cursor-pointer select-none`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={clearLongPress}
        onTouchMove={clearLongPress}
      >
        {children}
      </div>

      {menu.open && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} onContextMenu={(e) => { e.preventDefault(); closeMenu(); }} />
          <div
            className="fixed z-50 flex flex-col rounded-xl border border-line bg-card p-1.5 shadow-xl dark:border-line-d dark:bg-card-d"
            style={{ left: menu.x, top: menu.y, width: MENU_WIDTH }}
          >
            <MenuItem icon={<PaperAirplaneIcon className="h-5 w-5" />} label={t.detailNavigate} onClick={navigate} disabled={!navHref} />
            <MenuItem icon={<PlusIcon className="h-5 w-5" />} label={t.detailAddVisit} onClick={() => openModal('addVisit')} />
            <MenuItem icon={<PencilSquareIcon className="h-5 w-5" />} label={t.detailEdit} onClick={() => openModal('edit')} />
          </div>
        </>
      )}

      {modal.open && (
        <RestaurantModal
          restaurantId={restaurantId}
          distanceM={distanceM}
          initialMode={modal.mode}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
          onChanged={onChanged}
        />
      )}
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-appetite-soft hover:text-appetite disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink dark:text-ink-d dark:hover:bg-appetite-soft-d dark:hover:text-appetite-d"
    >
      <span className="text-appetite dark:text-appetite-d">{icon}</span>
      {label}
    </button>
  );
}
