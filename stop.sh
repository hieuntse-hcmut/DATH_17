#!/usr/bin/env bash
cd "$(dirname "$0")"
docker compose -f docker-compose.yml down
echo "Đã dừng. (Dữ liệu DB vẫn còn. Muốn xóa hết: docker compose -f docker-compose.yml down -v)"