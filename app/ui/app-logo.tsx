// Copyright (C) 2026 Icarus. All rights reserved.

// Brand mark: a warm rounded tile with a noodle bowl next to the wordmark.
// Language-neutral (kept in the app's native brand form) so it can render on
// the login page, which sits outside the language provider.
export default function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-appetite text-3xl leading-none dark:bg-appetite-d">
        🍜
      </span>
      <span className="text-2xl font-extrabold tracking-tight text-ink dark:text-ink-d">吃什么</span>
    </div>
  );
}
