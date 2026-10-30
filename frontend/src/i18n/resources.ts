import commonVi from "./shared/vi.json";
import commonEn from "./shared/en.json";
import authVi from "~/pages/Auth/i18n/vi.json";
import authEn from "~/pages/Auth/i18n/en.json";
import homeVi from "~/pages/Home/i18n/vi.json";
import homeEn from "~/pages/Home/i18n/en.json";
import profileEn from "~/pages/Profile/i18n/en.json";
import profileVi from "~/pages/Profile/i18n/vi.json";
import myCoursesVi from "../pages/MyCourses/i18n/vi.json";
import myCoursesEn from "../pages/MyCourses/i18n/en.json";
import courseDetailVi from "~/pages/CourseDetail/i18n/vi.json";
import courseDetailEn from "~/pages/CourseDetail/i18n/en.json";
import discussionVi from "~/components/Discuss/i18n/vi.json";
import discussionEn from "~/components/Discuss/i18n/en.json";
import quizVi from "../pages/Quiz/i18n/vi.json";
import quizEn from "../pages/Quiz/i18n/en.json";
import userListVi from "~/pages/UserList/i18n/vi.json";
import userListEn from "~/pages/UserList/i18n/en.json";
import adminCourseListVi from "~/pages/AdminCourseList/i18n/vi.json";
import adminCourseListEn from "~/pages/AdminCourseList/i18n/en.json";
import courseAnalyticsVi from "~/pages/CourseAnalytics/i18n/vi.json";
import courseAnalyticsEn from "~/pages/CourseAnalytics/i18n/en.json";
const vi = {
  common: commonVi,
  auth: authVi,
  home: homeVi,
  myCourses: myCoursesVi,
  courseDetail: courseDetailVi,
  discussion: discussionVi,
  quiz: quizVi,
  userList: userListVi,
  adminCourseList: adminCourseListVi,
  courseAnalytics: courseAnalyticsVi,
  profile: profileVi,
};

const en: typeof vi = {
  common: commonEn,
  auth: authEn,
  home: homeEn,
  myCourses: myCoursesEn,
  courseDetail: courseDetailEn,
  discussion: discussionEn,
  quiz: quizEn,
  userList: userListEn,
  adminCourseList: adminCourseListEn,
  courseAnalytics: courseAnalyticsEn,
  profile: profileEn,
};

export const resources = { vi, en } as const;
