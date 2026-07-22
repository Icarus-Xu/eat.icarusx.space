#!/bin/sh
# Copyright (C) 2026 Icarus. All rights reserved.
set -e

REPO_DIR="$HOME/eat/repo"
COMPOSE_DIR="$HOME/eat"

echo "==> Syncing repo to origin/main..."
# Deploy target mirrors origin unconditionally; this heals any local
# divergence (stray merges/commits) that would break a plain pull.
git -C "$REPO_DIR" fetch origin
git -C "$REPO_DIR" reset --hard origin/main

echo "==> Building image..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" build eat-app

echo "==> Restarting service..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" up -d eat-app

echo "==> Done."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" ps eat-app
