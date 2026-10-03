# Frontend Source Architecture

Tài liệu này mô tả cấu hình và cách các phần hiện tại phối hợp với nhau trong `src/`. Các ví dụ đang gọi JSONPlaceholder hoặc dùng giao diện khung được ghi rõ là ví dụ, không phải backend/luồng sản phẩm hoàn chỉnh.

## Khởi động ứng dụng

`src/main.tsx` là entry point. Ứng dụng được render trong `StrictMode`; `QueryClientProvider` cung cấp React Query cho toàn bộ cây component; `RouterProvider` nhận router từ `src/routes/router.tsx`. React Query Devtools cũng đang được render tại đây. Cấu hình i18n và CSS toàn cục được import một lần ở entry point.

Luồng khởi động:

1. `index.html` khôi phục theme trước khi React render để hạn chế nháy sáng/tối.
2. `src/main.tsx` nạp i18n, CSS, router và các provider dùng chung.
3. Router chọn page phù hợp với URL.
4. Page gọi hooks React Query; query function gọi API service, service dùng Axios client.

## Routes

Routes được khai báo tập trung trong `src/routes/router.tsx` bằng `createBrowserRouter`:

| Path | Component | Layout |
| --- | --- | --- |
| `/` | `Home` (index route) | `MainLayout` |
| `/log-in` | `Auth` với `isLogin={true}` | Không dùng `MainLayout` |
| `/sign-up` | `Auth` với `isLogin={false}` | Không dùng `MainLayout` |

`MainLayout` hiển thị `Header`, `Outlet` cho page con và `Footer`. `Home` và `Auth` được tải bằng `React.lazy`. Khi thêm trang thuộc layout chính, thêm route con vào `children` của `/`; route cần layout riêng có thể được khai báo thành nhánh độc lập. Link điều hướng trong giao diện dùng `Link` từ `react-router`.

## Theme và style

- `src/index.css` import Tailwind CSS 4 và khai báo CSS custom properties cho màu sắc, bề mặt, đường viền và chữ ở `:root` (light) và `.dark` (dark).
- Khối `@theme inline` ánh xạ các biến CSS sang utility colors/fonts của Tailwind.
- Vite kích hoạt Tailwind qua `@tailwindcss/vite` trong `vite.config.ts`.
- Script trong `index.html` đọc `localStorage.theme`; nếu chưa có lựa chọn đã lưu, dùng `prefers-color-scheme`. Với dark mode, script gắn class `dark` lên `<html>` trước khi ứng dụng render.
- `src/components/ThemeToggle` đảo class `dark`, lưu lựa chọn (`light` hoặc `dark`) vào `localStorage` và cập nhật icon. Component hiện được dùng ở Home.

Khi thêm token màu/font dùng chung, cập nhật biến CSS và ánh xạ Tailwind thay vì lặp lại giá trị màu tùy ý trong từng page.

## React Query

`src/main.tsx` tạo một `QueryClient` và bọc ứng dụng bằng `QueryClientProvider`. Query keys, query functions và mutations được khai báo trong các file `*.query.ts` gần feature tương ứng; các component gọi hook thay vì tự quản lý vòng đời request.

- `src/pages/Auth/services/auth.query.ts` có `useMe`, `useLogin` và `useLogout`. `useMe` chỉ chạy khi access token tồn tại; đăng nhập cập nhật cache `['me']`; đăng xuất xóa cache.
- `src/services/example.query.ts` là hook mẫu cho `useQuery`, dùng key gồm tên resource và params để cache từng bộ tham số.
- Có thể truyền tùy chọn query vào hook mẫu; ưu tiên định nghĩa `queryKey` ổn định và kiểu dữ liệu cụ thể cho từng feature khi mở rộng.
- Devtools nằm cạnh router trong entry point và mặc định đóng.

## Axios và API services

`src/config/axiosClient.ts` xuất Axios instance dùng chung tên `api` cùng helper `getApi`, `postApi`, `putApi`, `deleteApi`.

- `baseURL` lấy từ `VITE_API_URL`.
- Request interceptor đọc access token từ `src/config/accessTokenStorage.ts` và gắn `Authorization: Bearer ...` nếu có.
- Response interceptor đổi envelope có `success: false` thành lỗi Axios. Với GET, nếu response có `data`, helper trả về phần `data`; các method khác trả envelope response body.
- Khi nhận HTTP 401, xóa access token và gọi callback đã đăng ký bằng `setUnauthorizedHandler`, ngoại trừ URL login để sai mật khẩu không bị xử lý như phiên hết hạn. Callback hiện chưa được đăng ký ở entry point.
- `src/pages/Auth/services/auth.api.ts` khai báo endpoint và kiểu dữ liệu auth; `src/services/example.api.ts` minh họa service dùng chung.

Đặt các hàm gọi endpoint trong `*.api.ts`, còn cache/query/mutation trong `*.query.ts`. Không gọi Axios trực tiếp từ UI. API auth cần backend trả đúng envelope/kiểu dữ liệu mà service đang kỳ vọng. `.env.example` trỏ tới JSONPlaceholder để minh họa; endpoint auth không tồn tại ở dịch vụ đó.

Access token hiện được lưu trong `localStorage`. Không lưu secret backend trong frontend hoặc trong biến `VITE_*`; các biến này được đóng gói để trình duyệt đọc được.

## Tổ chức mã nguồn

```text
src/
  assets/                 # Tài nguyên tĩnh import từ mã nguồn
  components/             # Component dùng chung
    LanguageSwitcher/     # Chọn ngôn ngữ
    ThemeToggle/          # Đổi theme
    layout/               # Header, Footer và các phần khung giao diện
  config/                 # Cấu hình tích hợp dùng chung
    accessTokenStorage.ts # Đọc/ghi/xóa access token
    axiosClient.ts        # Axios instance, interceptors và HTTP helpers
  features/               # Component/UI theo feature dùng chung (hiện có Auth)
  i18n/                   # Khởi tạo i18next, resources và bản dịch dùng chung
  layouts/                # Layout route và Outlet
  pages/                  # Page theo route/feature
    Auth/
      i18n/                # Bản dịch riêng cho auth
      services/            # API và query hooks của auth
    Home/
  routes/                 # Khai báo router
  services/               # API/query mẫu hoặc dịch vụ dùng chung
```

Quy ước mở rộng phù hợp với cấu trúc hiện tại:

- Đặt giao diện theo route trong `pages/<Feature>/`; component tái sử dụng đặt trong `components/` hoặc `features/` tùy phạm vi sử dụng.
- Đặt API và React Query hooks gần feature trong `pages/<Feature>/services/` khi chỉ feature đó dùng; dùng `src/services/` cho dịch vụ chia sẻ.
- Đặt cấu hình hạ tầng dùng chung trong `config/`, không để page tự tạo client riêng.
- Đặt bản dịch dùng chung trong `i18n/shared/`; bản dịch chỉ thuộc một feature ở thư mục `i18n/` của feature và đăng ký trong `src/i18n/resources.ts`.
- Import nội bộ qua alias `~/`, được cấu hình đồng bộ trong `vite.config.ts` và `tsconfig.app.json` để trỏ tới `src/`.

## Lưu ý

### Chạy các lệnh sau trước khi commit:

```bash
npm run lint # Có thể để sau hẳn fix, nhưng cần phải note lại
npm run build # Phải fix ngay trước khi commit
```

`build` chạy TypeScript project build trước khi Vite đóng gói. Hiện package chưa khai báo script test.

### Đảm bảo cấu trúc route và dùng lazy load page trước nếu cần thiết
### Đảm bảo cấu trúc .api.ts, .query.ts, .type.ts nhằm mục đích cache dữ liệu và code dễ đọc
### Hạn chế dùng type any nhất có thể
