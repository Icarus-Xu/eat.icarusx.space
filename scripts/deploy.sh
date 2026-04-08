#!/bin/sh
# Copyright (C) 2026 Icarus. All rights reserved.
set -e

REPO_DIR="$HOME/eat/repo"
COMPOSE_DIR="$HOME/eat"

echo "==> Pulling latest code..."
git -C "$REPO_DIR" pull --ff-only

echo "==> Building image..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" build eat-app

echo "==> Restarting service..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" up -d eat-app

echo "==> Done."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" ps eat-app
