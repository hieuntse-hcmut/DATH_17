import { lazy } from "react";
import { createBrowserRouter } from "react-router";

import MainLayout from "~/layouts/Main.layout";
import RequireAuth from "~/features/Auth/RequireAuth";
// Lazy load components
const Home = lazy(() => import("~/pages/Home"));
const Auth = lazy(() => import("~/pages/Auth"));
const MyCourses = lazy(() => import("~/pages/MyCourses"));
const CourseDetail = lazy(() => import("~/pages/CourseDetail"));
const Discuss = lazy(() => import("~/pages/Home/components/Discuss"));

export const router = createBrowserRouter([
    {
        element: <RequireAuth />,
        children: [
            {
                path: "/",
                element: <MainLayout />,
                children: [
                    { index: true, element: <Home /> },
                    { path: "my-courses", element: <MyCourses /> },
                    {
                        path: "courses/:courseId/lessons/:lessonId?",
                        element: <CourseDetail />,
                    },
                    { path: "/discuss", element: <Discuss /> },
                ],
            },
        ],
    },
    { path: "/login", element: <Auth isLogin={true} /> },
    { path: "/register", element: <Auth isLogin={false} /> },
]);