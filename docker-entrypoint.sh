#!/bin/sh
# Copyright (C) 2026 Icarus. All rights reserved.
set -e

REPO_URL="https://github.com/Icarus-Xu/eat.icarusx.space.git"
REPO_DIR="/app/source"

echo "==> Updating source code..."
if [ -d "$REPO_DIR/.git" ]; then
  git -C "$REPO_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"

echo "==> Installing dependencies..."
corepack enable pnpm
pnpm config set registry https://registry.npmmirror.com
pnpm install --frozen-lockfile

echo "==> Building application..."
pnpm build

echo "==> Copying static assets..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "==> Starting server..."
export NODE_ENV=production
exec node .next/standalone/server.js
