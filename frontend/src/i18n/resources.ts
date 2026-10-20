import commonVi from "./shared/vi.json";
import commonEn from "./shared/en.json";
import authVi from "~/pages/Auth/i18n/vi.json";
import authEn from "~/pages/Auth/i18n/en.json";
import homeVi from "~/pages/Home/i18n/vi.json";
import homeEn from "~/pages/Home/i18n/en.json";
import myCoursesVi from "../pages/MyCourses/i18n/vi.json";
import myCoursesEn from "../pages/MyCourses/i18n/en.json";
const vi = {
    common: commonVi,
    auth: authVi,
    home: homeVi,
    myCourses: myCoursesVi,
};

const en: typeof vi = {
    common: commonEn,
    auth: authEn,
    home: homeEn,
    myCourses: myCoursesEn,
};

export const resources = { vi, en } as const;
