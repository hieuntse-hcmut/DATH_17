#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

COMPOSE="docker compose -f docker-compose.yml"

# Các tùy chọn tham số:
#   ./run.sh          : Chạy bình thường
#   ./run.sh --seed   : Nạp lại sample data chuẩn
#   ./run.sh --build  : Rebuild lại container (frontend/backend)
#   ./run.sh --clean  : Reset hoàn toàn dữ liệu DB và nạp lại từ đầu

REBUILD=false
FORCE_SEED=false
RESET_DB=false

for arg in "$@"; do
  case $arg in
    --build) REBUILD=true ;;
    --seed) FORCE_SEED=true ;;
    --clean) RESET_DB=true; FORCE_SEED=true ;;
  esac
done

echo "=========================================================="
echo "          SMART CAMPUS - KHỞI ĐỘNG HỆ THỐNG"
echo "=========================================================="

echo "[0/5] Kiểm tra Docker..."
docker info >/dev/null 2>&1 || { echo "[LỖI] Docker chưa chạy. Hãy bật Docker rồi chạy lại."; exit 1; }

# Khởi tạo file .env nếu chưa có
if [ ! -f .env ]; then
  if [ -f _env ]; then 
    mv _env .env
  else 
    echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
  fi
fi

if ! grep -q '^JWT_SECRET=' .env; then
  echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
fi

chmod +x backend/mvnw 2>/dev/null || true
chmod +x stop.sh 2>/dev/null || true

if [ "$RESET_DB" = true ]; then
  echo "[i] Đang dừng và xóa volume DB cũ theo yêu cầu (--clean)..."
  $COMPOSE down -v
fi

echo "[1/5] Khởi động MySQL..."
$COMPOSE up -d mysql

echo "[2/5] Chờ MySQL sẵn sàng..."
for i in $(seq 1 45); do
  if docker exec smart-campus-mysql mysqladmin ping -h 127.0.0.1 -uroot -proot --silent >/dev/null 2>&1; then
    break
  fi
  [ "$i" = 45 ] && { echo "[LỖI] MySQL không sẵn sàng sau 45s. Xem: docker logs smart-campus-mysql"; exit 1; }
  sleep 2
done
echo "      -> MySQL đã sẵn sàng!"

echo "[3/5] Khởi động backend + frontend..."
if [ "$REBUILD" = true ]; then
  $COMPOSE up -d --build
else
  $COMPOSE up -d backend frontend
fi

echo "[4/5] Chờ Backend & Spring Boot sẵn sàng..."
for i in $(seq 1 60); do
  if curl -s http://localhost:8080/api/health 2>/dev/null | grep -q "OK"; then
    break
  fi
  if [ "$i" = 60 ]; then
    echo "[CẢNH BÁO] Backend đang khởi động chậm. Bạn có thể kiểm tra: docker logs -f smart-campus-backend"
    break
  fi
  sleep 2
done
echo "      -> Backend đã sẵn sàng!"

# Kiểm tra và nạp Sample Data
SAMPLE_SQL="backend/dev-data/sample-data-full.sql"
if [ -f "$SAMPLE_SQL" ]; then
  COURSES_COUNT=$(docker exec -i smart-campus-mysql mysql -usmartcampus -psmartcampus smart_campus -N -e "SELECT COUNT(*) FROM courses;" 2>/dev/null || echo "0")
  if [ "$FORCE_SEED" = true ] || [ "$COURSES_COUNT" -eq 0 ]; then
    echo "[5/5] Nạp Sample Data (10 Sinh viên, 3 Giảng viên, 1 Admin, 6 Khóa học)..."
    docker exec -i smart-campus-mysql mysql -usmartcampus -psmartcampus --default-character-set=utf8mb4 smart_campus < "$SAMPLE_SQL"
    echo "      -> Đã nạp thành công dữ liệu mẫu!"
  else
    echo "[5/5] Database đã có sẵn $COURSES_COUNT khóa học (Bỏ qua nạp lại; dùng ./run.sh --seed nếu muốn reset lại)."
  fi
fi

echo
echo "=========================================================="
echo "          HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG!"
echo "=========================================================="
echo "  🌐 Frontend : http://localhost:5173"
echo "  ☕ Backend  : http://localhost:8080"
echo "  📖 Swagger  : http://localhost:8080/swagger-ui/index.html"
echo
echo "  👤 Tài khoản kiểm thử (Password: 123456):"
echo "     - Admin     : admin"
echo "     - Giảng viên: lecturer_hung, lecturer_lan, lecturer_minh"
echo "     - Sinh viên : student_dat, student_hoa, student_quan, ..."
echo
echo "  🛑 Dừng hệ thống: ./stop.sh"
echo "=========================================================="

(command -v xdg-open >/dev/null && xdg-open http://localhost:5173) 2>/dev/null || \
(command -v open >/dev/null && open http://localhost:5173) 2>/dev/null || true
