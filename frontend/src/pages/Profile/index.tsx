import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faIdCard,
  faCamera,
  faLock,
  faSun,
  faMoon,
  faGlobe,
  faShieldHalved,
  faRightFromBracket,
  faBookOpen,
  faArrowRight,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { useLogout } from "~/pages/Auth/services/auth.query";
import { useMe } from "~/services/me.query";
import { useProfileCourses } from "./services/profileCourses.query";

export default function Profile() {
  const { t, i18n } = useTranslation("profile");
  const {
    data: me,
    isLoading: isMeLoading,
    isError: isMeError,
    refetch: refetchMe,
  } = useMe();
  const {
    data: courses = [],
    isLoading: areCoursesLoading,
    isError: areCoursesError,
    refetch: refetchCourses,
  } = useProfileCourses({ staleTime: 30_000 });
  const logout = useLogout();
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark");
  });

  // Xử lý chuyển đổi Chế độ giao diện (Dark / Light Theme)
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Xử lý chuyển đổi Ngôn ngữ
  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-slate-900 px-4 py-6 pb-28 md:px-6 md:py-8 flex justify-center text-[#131B2E] dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-[1024px] flex flex-col gap-6 md:gap-8">
        
        {/* ================= 1. PROFILE HERO BANNER ================= */}
        <div className="relative h-[184px] w-full overflow-hidden rounded-xl border border-slate-100 bg-[#FAF8FF] shadow-sm dark:border-slate-700/60 dark:bg-slate-800 md:h-[194px] md:rounded-2xl md:bg-white md:dark:bg-slate-800">
          {/* Mobile keeps the full gradient card; desktop separates the theme-aware lower surface. */}
          <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#3525CD_0%,#4F46E5_99.99%,#494FC9_100%)] md:inset-x-0 md:top-0 md:bottom-auto md:h-[99px] md:bg-[linear-gradient(90deg,#3525CD_0%,#4F46E5_50%,#494FC9_100%)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(255,255,255,0.75)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
            />
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-[20px] pointer-events-none md:h-64 md:w-64 md:bg-indigo-300/20 md:blur-xl" />
            <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-indigo-300/20 blur-xl pointer-events-none md:left-1/3 md:h-32 md:w-48 md:rounded-full md:bg-indigo-500/30 md:blur-2xl" />
          </div>

          {/* Profile overview */}
          <div className="absolute inset-x-0 top-6 flex flex-col items-center gap-2 px-6 md:inset-x-0 md:top-auto md:bottom-0 md:flex-row md:items-end md:px-8 md:pb-6">
            <div className="flex min-w-0 flex-col items-center gap-2 md:flex-row md:gap-6">
              <div className="relative h-24 w-24 shrink-0 rounded-full border-2 border-white/50 bg-white/30 p-1 shadow-lg md:h-32 md:w-32 md:rounded-2xl md:border-white md:bg-[#F2F3FF] md:shadow-md md:dark:border-slate-800 md:dark:bg-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256"
                  alt={me?.fullName || t("profile.title")}
                  className="h-full w-full rounded-full object-cover shadow-sm md:rounded-xl"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 right-1 grid size-8 place-items-center rounded-full bg-white text-[#3525CD] shadow-md transition-colors dark:bg-slate-900 dark:text-indigo-300 md:bottom-2 md:right-2 md:size-9 md:rounded-xl md:bg-white md:text-[#3525CD] md:dark:bg-slate-900 md:dark:text-indigo-300"
                >
                  <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
                </span>
              </div>

              <div className="flex min-w-0 flex-col items-center gap-2 md:items-start">
                <h1 className="max-w-full truncate text-center text-2xl font-semibold leading-8 tracking-[-0.6px] text-white md:rounded-full md:bg-[#7FFC97] md:px-4 md:py-1 md:text-left md:text-2xl md:leading-9 md:tracking-tight md:text-[#005320] md:shadow-sm">
                  {isMeLoading ? t("profile.loading") : me?.fullName || me?.username || t("profile.title")}
                </h1>
                {me && (
                  <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 md:inline md:text-sm">
                    {t("profile.role")}: {me.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. MAIN GRID LAYOUT (4 Cols Left & 8 Cols Right) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          
          {/* CỘT TRÁI (4 Cột trên Desktop): Thông tin cá nhân, Bảo mật & Trợ giúp */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* THẺ THÔNG TIN CÁ NHÂN */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-[#3525CD] dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-[#131B2E] dark:text-white">
                  {t("profile.personal_info")}
                </h2>
              </div>

              {isMeLoading ? (
                <div className="h-24 animate-pulse rounded-xl bg-[#F2F3FF] dark:bg-slate-700/50" />
              ) : isMeError ? (
                <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                  <p>{t("profile.load_error")}</p>
                  <button
                    type="button"
                    onClick={() => void refetchMe()}
                    className="mt-2 font-semibold underline underline-offset-2"
                  >
                    {t("profile.retry")}
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-[#F2F3FF] dark:bg-slate-700/50 p-2.5 rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#EAEDFF] dark:bg-slate-600 rounded-lg flex items-center justify-center text-[#3525CD] dark:text-indigo-300 flex-shrink-0">
                      <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("profile.username")}
                      </span>
                      <span className="text-sm font-medium text-[#464555] dark:text-slate-200">
                        {me?.username || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F2F3FF] dark:bg-slate-700/50 p-2.5 rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#EAEDFF] dark:bg-slate-600 rounded-lg flex items-center justify-center text-[#3525CD] dark:text-indigo-300 flex-shrink-0">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                    </div>
                    <div className="flex min-w-0 flex-col overflow-hidden">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("profile.email")}
                      </span>
                      <span className="truncate text-sm font-medium text-[#464555] dark:text-slate-200">
                        {me?.email || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F2F3FF] dark:bg-slate-700/50 p-2.5 rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#EAEDFF] dark:bg-slate-600 rounded-lg flex items-center justify-center text-[#3525CD] dark:text-indigo-300 flex-shrink-0">
                      <FontAwesomeIcon icon={faIdCard} className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("profile.account_id")}
                      </span>
                      <span className="text-sm font-medium text-[#464555] dark:text-slate-200">
                        {me?.id ?? "—"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* THẺ CÀI ĐẶT & BẢO MẬT */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-[#3525CD] dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-[#131B2E] dark:text-white">
                  {t("profile.security_settings", "Cài đặt & bảo mật")}
                </h2>
              </div>

              {/* Đổi Mật Khẩu */}
              <div className="bg-[#F2F3FF] dark:bg-slate-700/50 p-3 rounded-xl flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EAEDFF] dark:bg-slate-600 rounded-lg flex items-center justify-center text-[#3525CD] dark:text-indigo-300">
                    <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#131B2E] dark:text-white">
                      {t("profile.change_password", "Đổi mật khẩu")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.click_to_change_pass", "Ấn vào để đổi mật khẩu")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chế độ Giao diện */}
              <button
                type="button"
                onClick={toggleTheme}
                className="bg-[#F2F3FF] dark:bg-slate-700/50 p-3 rounded-xl flex items-center justify-between hover:bg-indigo-100/50 dark:hover:bg-slate-700 transition-colors w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EAEDFF] dark:bg-slate-600 rounded-lg flex items-center justify-center text-[#3525CD] dark:text-indigo-300">
                    <FontAwesomeIcon icon={isDark ? faMoon : faSun} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#131B2E] dark:text-white">
                      {t("profile.theme", "Chế độ giao diện")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isDark ? t("profile.theme_dark", "Tối") : t("profile.theme_light", "Sáng")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-600 text-[#3525CD] dark:text-indigo-300 shadow-xs">
                  {isDark ? "DARK" : "LIGHT"}
                </span>
              </button>

              {/* Tùy chỉnh Ngôn ngữ */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="bg-[#F2F3FF] dark:bg-slate-700/50 p-3 rounded-xl flex items-center justify-between hover:bg-indigo-100/50 dark:hover:bg-slate-700 transition-colors w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EAEDFF] dark:bg-slate-600 rounded-lg flex items-center justify-center text-[#3525CD] dark:text-indigo-300">
                    <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#131B2E] dark:text-white">
                      {t("profile.language", "Tùy chỉnh ngôn ngữ")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.lang_name", "Tiếng Việt")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-600 text-[#3525CD] dark:text-indigo-300 shadow-xs uppercase">
                  {i18n.language}
                </span>
              </button>
            </div>

            {/* THẺ TRỢ GIÚP, PHÁP LÝ & ĐĂNG XUẤT */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col gap-3">
              {/* Icon Trợ giúp hình Trái đất theo note comment */}
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-[#3525CD] dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-[#131B2E] dark:text-white">
                  {t("profile.help_legal", "Trợ giúp & pháp lý")}
                </h2>
              </div>

              {/* Các chính sách */}
              <div className="bg-[#F2F3FF] dark:bg-slate-700/50 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EAEDFF] dark:bg-slate-600 rounded-lg flex items-center justify-center text-[#3525CD] dark:text-indigo-300">
                    <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#131B2E] dark:text-white">
                      {t("profile.policies", "Các chính sách")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.agreed_on_signup", "Đã được đồng ý khi tạo tài khoản")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút Đăng xuất */}
              <button
                type="button"
                onClick={logout}
                className="mt-2 w-full h-12 bg-[#FFDAD6] dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-[#93000A] dark:text-rose-300 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                {t("profile.logout", "Đăng xuất tài khoản")}
              </button>
            </div>

          </div>

          {/* CỘT PHẢI (7 Cột trên Desktop): Hoạt động học thuật & Danh sách khóa học */}
          {me?.role !== "ADMIN" && (
            <div className="md:col-span-7 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col gap-5 h-fit">
                
                {/* Header Hoạt động học thuật */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBookOpen} className="w-5 h-5 text-[#3525CD] dark:text-indigo-400" />
                      <h2 className="text-xl font-semibold text-[#131B2E] dark:text-white">
                        {t("profile.academic_activities", "Hoạt động học thuật")}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("profile.academic_sub", "Kỳ học học vụ 2024.2 - Tiến độ và đánh giá chi tiết")}
                    </p>
                  </div>

                  <Link
                    to="/my-courses"
                    className="px-3.5 py-2 bg-[#EAEDFF] dark:bg-slate-700 text-[#3525CD] dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-600 font-semibold text-xs rounded-xl transition-colors self-start sm:self-auto"
                  >
                    {t("profile.view_all_courses")}
                  </Link>
                </div>

                {/* Danh sách các khóa học tiêu biểu */}
                {areCoursesLoading ? (
                  <div className="flex flex-col gap-4" aria-busy="true">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-28 animate-pulse rounded-xl bg-[#F2F3FF] dark:bg-slate-700/40"
                      />
                    ))}
                  </div>
                ) : areCoursesError ? (
                  <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                    <p>{t("profile.courses_error")}</p>
                    <button
                      type="button"
                      onClick={() => void refetchCourses()}
                      className="mt-2 font-semibold underline underline-offset-2"
                    >
                      {t("profile.retry")}
                    </button>
                  </div>
                ) : courses.length === 0 ? (
                  <p className="rounded-xl bg-[#F2F3FF] p-5 text-center text-sm text-slate-500 dark:bg-slate-700/40 dark:text-slate-400">
                    {t("profile.no_courses")}
                  </p>
                ) : (
                <div className="flex flex-col gap-4">
                  {courses.map((course) => (
                    <article
                      key={course.id}
                      className="bg-[#F2F3FF] dark:bg-slate-700/40 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-[#E2DFFF] dark:bg-indigo-950/60 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs">
                          <FontAwesomeIcon icon={faCode} className="w-5 h-5 text-[#3525CD] dark:text-indigo-400" />
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#EAEDFF] dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded">
                              #{course.id}
                            </span>
                            <h3 className="text-sm font-semibold text-[#131B2E] dark:text-white line-clamp-1">
                              {course.title}
                            </h3>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t("profile.lecturer")}: {course.instructorName}
                          </p>
                          {/* Thanh Tiến Độ */}
                          {me?.role === "STUDENT" && (
                            <div className="w-full max-w-[280px] mt-1">
                              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <span>{t("profile.progress", "Tiến độ")}</span>
                                <span className="text-[#3525CD] dark:text-indigo-400">
                                  {Math.round(course.progressPercent)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-[#EAEDFF] dark:bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#3525CD] dark:bg-indigo-500 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, course.progressPercent))}%`,
                                  }}
                                />
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                {t("profile.lessons_complete", {
                                  complete: course.completeLesson,
                                  total: course.totalLesson,
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nút bấm Icon "Tiếp tục học" theo Note comment */}
                      <Link
                        to={`/courses/${course.id}/lessons`}
                        className="w-full sm:w-auto px-4 py-2 bg-[#4F46E5] dark:bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors flex-shrink-0 shadow-xs"
                      >
                        <span>{me?.role === "STUDENT" ? t("profile.continue_learning") : "Chỉnh sửa"}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                      </Link>
                    </article>
                  ))}
                </div>
                )}

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}