```js
export default defineConfig([
  # Frontend

  Frontend của dự án học trực tuyến, xây dựng bằng React và TypeScript. Ứng dụng hiện có các trang Home và xác thực mẫu, định tuyến phía trình duyệt, đổi ngôn ngữ/theme, cùng ví dụ gọi API và quản lý dữ liệu bằng React Query.

  ## Yêu cầu

  - Node.js phiên bản tương thích với Vite 8.
  - npm.

  ## Cài đặt và chạy

  Từ thư mục `frontend`:

  ```bash
  npm install
  cp .env.example .env
  ```

  ```bash
  npm run dev
  ```

  Vite sẽ in địa chỉ local (thường là `http://localhost:5173`). Các lệnh khác:

  ```bash
  npm run lint       # Kiểm tra ESLint
  npm run build      # TypeScript build check và tạo bản production trong dist/
  npm run preview    # Phục vụ bản build production ở local
  ```

  ## Tech stack

  | Công nghệ | Tác dụng trong dự án |
  | --- | --- |
  | React 19 | Xây dựng giao diện theo component. |
  | TypeScript 6 | Kiểm tra kiểu cho ứng dụng và mã nguồn. |
  | Vite 8 | Dev server có HMR và đóng gói production. |
  | React Router | Khai báo các route trình duyệt và layout lồng nhau. |
  | TanStack React Query | Quản lý trạng thái dữ liệu từ server, query/mutation và cache. |
  | Axios | Tạo HTTP client dùng chung, gắn access token và xử lý response. |
  | Tailwind CSS 4 | Utility CSS; tích hợp qua plugin Vite và bộ token trong `src/index.css`. |
  | i18next + react-i18next | Quản lý bản dịch tiếng Việt/tiếng Anh trong React. |
  | Font Awesome | Icon, bao gồm icon đổi theme. |
  | ESLint | Kiểm tra quy tắc và lỗi phổ biến trong mã nguồn. |

  ## Tài liệu kiến trúc

  Xem [srcArchitect.md](srcArchitect.md) để biết cấu hình route, theme, React Query, Axios và cách tổ chức mã nguồn.

  ## Trạng thái hiện tại

  - `.env.example` đang dùng JSONPlaceholder làm API mẫu.
  - Trang Home dùng endpoint `posts` để minh họa fetch/cache và điều khiển theme.
  - Các trang auth hiện là giao diện khung, chưa có form đăng nhập/đăng ký hoàn chỉnh.
