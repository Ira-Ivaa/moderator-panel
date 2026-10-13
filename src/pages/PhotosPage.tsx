import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { endpoints } from "../api/endpoints";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { useFetch } from "../hooks/useFetch";
import type { Photo } from "../types";
import { simulateHeavyRender } from "../utils/simulateHeavyRender";
import { useVirtualizer } from "@tanstack/react-virtual";

// ЗАДАЧА 6. Страница работает, но тормозит.
// Найдите проблемы производительности и исправьте их.
// Логику и внешний вид страницы менять не нужно.

const ALBUM_IDS = Array.from({ length: 100 }, (_, i) => i + 1);

type PhotoRowProps = {
  photo: Photo;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
};

type VirtualListProps = {
  visiblePhotos: Photo[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

const PhotoRow = memo(function PhotoRow({
  photo,
  isFavorite,
  onToggleFavorite,
}: PhotoRowProps) {
  simulateHeavyRender();

  return (
    <div className="photo-row">
      <span className="photo-row__id">#{photo.id}</span>
      <span className="photo-row__title">{photo.title}</span>
      <span className="muted">Альбом {photo.albumId}</span>
      <button
        type="button"
        className="button"
        onClick={() => onToggleFavorite(photo.id)}
      >
        {isFavorite ? "Убрать" : "В избранное"}
      </button>
    </div>
  );
});

export function VirtualList({
  visiblePhotos,
  favorites,
  onToggleFavorite,
}: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: visiblePhotos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  return (
    <div className="photo-list" ref={parentRef}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((item) => {
          const photo = visiblePhotos[item.index];
          return (
            <div
              key={photo.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${item.start}px)`,
              }}
            >
              <PhotoRow
                photo={photo}
                isFavorite={favorites.includes(photo.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeOnPage({ startedAt }: { startedAt: number }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  return <p className="muted">Вы на странице {seconds} с</p>;
}

export default function PhotosPage() {
  const {
    data: photos,
    isLoading,
    error,
    refetch,
  } = useFetch<Photo[]>(endpoints.photos);

  const [query, setQuery] = useState("");
  const [albumId, setAlbumId] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [favorites, setFavorites] = useState<number[]>([]);

  const [startedAt] = useState(() => Date.now());

  const visiblePhotos = useMemo(() => {
    const q = query.toLowerCase();
    return (photos ?? [])
      .filter((photo) => albumId === "all" || photo.albumId === Number(albumId))
      .filter((photo) => photo.title.toLowerCase().includes(q))
      .sort((a, b) =>
        sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title),
      );
  }, [photos, albumId, query, sortOrder]);

  const handleToggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((favoriteId) => favoriteId !== id)
        : [...prev, id],
    );
  }, []);

  if (isLoading) return <Loader text="Загружаем медиатеку..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <section>
      <h1>Медиатека</h1>
      <TimeOnPage startedAt={startedAt} />

      <div className="toolbar">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию"
        />
        <select
          className="input"
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
        >
          <option value="all">Все альбомы</option>
          {ALBUM_IDS.map((id) => (
            <option key={id} value={id}>
              Альбом {id}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        >
          <option value="asc">А–Я</option>
          <option value="desc">Я–А</option>
        </select>
      </div>

      <p>
        Показано: {visiblePhotos.length} из {photos?.length ?? 0}. В избранном:{" "}
        {favorites.length}
      </p>

      <VirtualList
        visiblePhotos={visiblePhotos}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      ></VirtualList>
    </section>
  );
}
