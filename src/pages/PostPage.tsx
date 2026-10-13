import { Link, useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import type { Comment, Post } from "../types";
import { endpoints } from "../api/endpoints";
import { Loader } from "../components/Loader";
import { ErrorMessage } from "../components/ErrorMessage";
import { AuthorBadge } from "../components/AuthorBadge";
import { CommentList } from "../components/CommentList";
import { CommentForm } from "../components/CommentForm";
import { useState } from "react";

/**
 * TODO (задача 4): соберите страницу поста.
 *
 * 1. Загрузите пост: useFetch<Post>(endpoints.post(postId)).
 * 2. Загрузите комментарии: useFetch<Comment[]>(endpoints.postComments(postId)).
 * 3. Обработайте состояния поста:
 *    - загрузка -- Loader;
 *    - статус 404 -- сообщение «Пост не найден» и ссылка на /posts
 *      (проверьте на адресе /posts/9999);
 *    - любая другая ошибка -- ErrorMessage с кнопкой «Повторить».
 * 4. Покажите заголовок и текст поста, под ними -- <AuthorBadge userId={post.userId} />.
 * 5. Покажите комментарии через CommentList (со своими состояниями загрузки и ошибки).
 * 6. Под списком -- CommentForm. Новый комментарий храните в локальном state
 *    и выводите вместе с загруженными.
 *
 * Подсказка: jsonplaceholder не сохраняет данные и всегда возвращает id: 501.
 * Чтобы key не повторялся, перед добавлением замените id, например на Date.now().
 */
export default function PostPage() {
  const { postId = "" } = useParams();

  const post = useFetch<Post>(endpoints.post(postId));
  const comment = useFetch<Comment[]>(endpoints.postComments(postId));

  const [newComments, setNewComments] = useState<Comment[]>([]);

  function handleCreated(created: Comment) {
    setNewComments((prev) => [...prev, { ...created, id: Date.now() }]);
  }

  if (post.isLoading) return <Loader />;
  if (post.status === 404) {
    return (
      <div>
        <p>Пост не найден</p>
        <Link to="/posts">← К списку постов</Link>
      </div>
    );
  } else if (post.error)
    return <ErrorMessage message={post.error} onRetry={post.refetch} />;
  if (!post.data) return null;

  return (
    <section>
      <Link to="/posts" className="back-link">
        ← К списку постов
      </Link>
      <article>
        <h1>{post.data.title}</h1>
        <p>{post.data.body}</p>
        <AuthorBadge userId={post.data.userId} />
      </article>
      {comment.isLoading ? (
        <Loader text="Загружаем комментарии..." />
      ) : comment.error ? (
        <ErrorMessage message={comment.error} onRetry={comment.refetch} />
      ) : (
        <CommentList comments={[...(comment.data ?? []), ...newComments]} />
      )}
      <CommentForm postId={Number(postId)} onCreated={handleCreated} />
    </section>
  );
}
