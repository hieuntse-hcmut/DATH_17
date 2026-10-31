#!/usr/bin/env bash
cd "$(dirname "$0")"

COMPOSE="docker compose -f docker-compose.yml"

if [ "$1" = "-v" ] || [ "$1" = "--clean" ]; then
  echo "Đang dừng toàn bộ containers và XÓA dữ liệu volumes..."
  $COMPOSE down -v
  echo "Đã dừng và làm sạch toàn bộ dữ liệu (volumes đã được xóa)."
else
  echo "Đang dừng toàn bộ containers..."
  $COMPOSE down
  echo "Đã dừng hệ thống thành công."
  echo "(Dữ liệu DB vẫn được lưu giữ. Nếu muốn xóa sạch DB: ./stop.sh -v)"
fi
