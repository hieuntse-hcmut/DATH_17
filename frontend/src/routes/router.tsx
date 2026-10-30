import { lazy } from "react";
import { createBrowserRouter } from "react-router";

import MainLayout from "~/layouts/Main.layout";
import AdminLayout from "~/layouts/Admin.layout";

// Lazy load components
const Home = lazy(() => import("~/pages/Home"));
const Auth = lazy(() => import("~/pages/Auth"));
const MyCourses = lazy(() => import("~/pages/MyCourses"));
const CourseDetail = lazy(() => import("~/pages/CourseDetail"));
const QuizList = lazy(() => import("~/pages/Quiz"));
const QuizAttempt = lazy(() => import("~/pages/Quiz/components/QuizAttempt"));
const UserList = lazy(() => import("~/pages/UserList"));
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
      { path: "/courses/:courseId/quizzes", element: <QuizList /> },
      //   {
      //     path: '/example',
      //     element: <div>Example Page</div>,
      //     children: []
      //   } => example routes
    ],
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        path: "users",
        element: <UserList />,
      }
    ]
  },
  {
    path: "/login",
    element: <Auth isLogin={true} />,
  },
  {
    path: "/register",
    element: <Auth isLogin={false} />,
  },
  { path: "/courses/:courseId/quizzes/:quizId", element: <QuizAttempt /> },
]);
