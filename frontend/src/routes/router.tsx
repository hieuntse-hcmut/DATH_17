import { lazy } from "react";
import { createBrowserRouter } from "react-router";

import MainLayout from "~/layouts/Main.layout";

// Lazy load components
const Home = lazy(() => import("~/pages/Home"));
const Auth = lazy(() => import("~/pages/Auth"));
const MyCourses = lazy(() => import("~/pages/MyCourses"));
const CourseDetail = lazy(() => import("~/pages/CourseDetail"));
const Discuss = lazy(() => import("~/pages/Home/components/Discuss"));

export const router = createBrowserRouter([
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
            { 
              path: '/discuss',
              element: <Discuss />,
            },
            //   {
            //     path: '/example',
            //     element: <div>Example Page</div>,
            //     children: []
            //   } => example routes
        ],
    },
    {
        path: "/login",
        element: <Auth isLogin={true} />,
    },
    {
        path: "/register",
        element: <Auth isLogin={false} />,
    },
]);