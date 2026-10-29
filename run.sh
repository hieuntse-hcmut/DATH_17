#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
COMPOSE="docker compose -f docker-compose.yml"

echo "[0/4] Kiểm tra Docker..."
docker info >/dev/null 2>&1 || { echo "[LỖI] Docker chưa chạy. Hãy bật Docker rồi chạy lại."; exit 1; }

if [ ! -f .env ]; then
  if [ -f _env ]; then mv _env .env
  else echo "JWT_SECRET=$(openssl rand -base64 32)" > .env; fi
fi
grep -q '^JWT_SECRET=' .env || { echo "[LỖI] .env thiếu dòng JWT_SECRET=..."; exit 1; }
chmod +x backend/mvnw 2>/dev/null || true

echo "[1/4] Khởi động MySQL..."
$COMPOSE up -d mysql

echo "[2/4] Chờ MySQL sẵn sàng..."
for i in $(seq 1 40); do
  docker exec smart-campus-mysql mysqladmin ping -h 127.0.0.1 -uroot -proot --silent >/dev/null 2>&1 && break
  [ "$i" = 40 ] && { echo "[LỖI] MySQL không sẵn sàng. Xem: docker logs smart-campus-mysql"; exit 1; }
  sleep 3
done

echo "[3/4] Khởi động backend + frontend (lần đầu mất vài phút)..."
$COMPOSE up -d backend frontend

echo "[4/4] Chờ backend lên..."
for i in $(seq 1 100); do
  curl -s -o /dev/null http://localhost:8080 && break
  [ "$i" = 100 ] && { echo "[LỖI] Backend chưa lên. Xem: docker logs smart-campus-backend"; exit 1; }
  sleep 3
done

echo
echo "===== SẴN SÀNG ====="
echo "  Frontend: http://localhost:5173"
echo "  Backend : http://localhost:8080"
echo "  Dừng lại: ./stop-dev.sh"
(command -v xdg-open >/dev/null && xdg-open http://localhost:5173) || (command -v open >/dev/null && open http://localhost:5173) || true