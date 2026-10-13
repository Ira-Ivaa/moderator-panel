import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { lazy, Suspense } from "react";
import { Loader } from "./components/Loader";

// TODO (задача 7): сейчас код всех страниц попадает в один бандл.
// Переведите импорты страниц на React.lazy и добавьте Suspense с fallback.
// import PostsPage from './pages/PostsPage';
// import PostPage from './pages/PostPage';
// import UsersPage from './pages/UsersPage';
// import PhotosPage from './pages/PhotosPage';
// import NotFoundPage from './pages/NotFoundPage';

const PostsPage = lazy(() => import("./pages/PostsPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const PhotosPage = lazy(() => import("./pages/PhotosPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageSuspense() {
  return (
    <Suspense fallback={<Loader text="Загружаем страницу..." />}>
      <Outlet />
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<PageSuspense />}>
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:postId" element={<PostPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
