import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import AddBookModal from "../../../books/components/AddBookModal/AddBookModal";
import BackButton from "../../../../components/ui/BackButton/BackButton";
import Button from "../../../../components/ui/Button/Button";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import LoadingCovers from "../../../../components/ui/LoadingCovers/LoadingCovers";
import LoadMoreSentinel from "../../../../components/ui/LoadMoreSentinel/LoadMoreSentinel";
import PageHeader from "../../../../components/ui/PageHeader/PageHeader";
import { formatCount } from "../../../../utils/formatCount";
import BookCard from "../../../books/components/BookCard/BookCard";
import BooksGrid from "../../../books/components/BooksGrid/BooksGrid";
import WishlistItemSheet from "../../components/WishlistItemSheet/WishlistItemSheet";
import type { WishlistItem } from "../../dto/WishlistItem";
import { useGetWishlistQuery } from "../../wishlistApi";

const SKELETON_COUNT = 10;

const BookmarkIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

interface WishlistChunkProps {
  cursor: string;
  isLast: boolean;
  onLoadMore: (cursor: string) => void;
  onSelect: (item: WishlistItem) => void;
}

// Una tanda de 24 deseados a partir de un cursor. Cada tanda es su propia
// consulta, igual que en Biblioteca.
const WishlistChunk = ({
  cursor,
  isLast,
  onLoadMore,
  onSelect,
}: WishlistChunkProps) => {
  const { data, isFetching, isError, refetch } = useGetWishlistQuery({
    cursor,
  });

  if (isError) {
    return (
      <Box component="li" sx={{ gridColumn: "1 / -1", listStyle: "none" }}>
        <InlineError
          message="No hemos podido cargar más libros."
          onRetry={() => void refetch()}
        />
      </Box>
    );
  }

  if (!data) {
    return <LoadingCovers count={3} />;
  }

  const { nextCursor } = data;

  return (
    <>
      {data.items.map((item) => (
        <BookCard
          key={item.id}
          book={item.book}
          onSelect={() => onSelect(item)}
        />
      ))}
      {isFetching && <LoadingCovers count={3} />}
      {isLast && nextCursor && (
        <LoadMoreSentinel onVisible={() => onLoadMore(nextCursor)} />
      )}
    </>
  );
};

// Lista de deseos (HU-43, D-036): los libros que quieres tener, aparte de la
// biblioteca. Cuadrícula de portadas con scroll infinito; al tocar una se abre
// su hoja.
const WishlistPage = () => {
  const [moreCursors, setMoreCursors] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const { data, isLoading, isError, refetch } = useGetWishlistQuery();

  const loadMore = useCallback(
    (cursor: string) =>
      setMoreCursors((cursors) =>
        cursors.includes(cursor) ? cursors : [...cursors, cursor],
      ),
    [],
  );

  const selectItem = (item: WishlistItem) => setSelectedItem(item);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando tu lista de deseos">
          <BooksGrid isPlaceholder>
            <LoadingCovers count={SKELETON_COUNT} />
          </BooksGrid>
        </Box>
      );
    }

    if (isError || !data) {
      return (
        <InlineError
          message="No hemos podido cargar tu lista de deseos."
          onRetry={() => void refetch()}
        />
      );
    }

    if (data.items.length === 0) {
      return (
        <EmptyState
          icon={<BookmarkIcon />}
          title="Tu lista de deseos está vacía"
          description="Añade aquí los libros que quieres conseguir. Cuando los tengas, pásalos a tu biblioteca."
          action={
            <Button onClick={() => setIsAdding(true)}>Añadir a la lista</Button>
          }
        />
      );
    }

    return (
      <BooksGrid label="Libros que quieres tener">
        {data.items.map((item) => (
          <BookCard
            key={item.id}
            book={item.book}
            onSelect={() => selectItem(item)}
          />
        ))}
        {moreCursors.length === 0 && data.nextCursor && (
          <LoadMoreSentinel onVisible={() => loadMore(data.nextCursor ?? "")} />
        )}
        {moreCursors.map((cursor, index) => (
          <WishlistChunk
            key={cursor}
            cursor={cursor}
            isLast={index === moreCursors.length - 1}
            onLoadMore={loadMore}
            onSelect={selectItem}
          />
        ))}
      </BooksGrid>
    );
  };

  return (
    <Box component="main" sx={{ maxWidth: 960, mx: "auto", p: 4 }}>
      <Box sx={{ pt: "env(safe-area-inset-top)", mb: 2, ml: -2 }}>
        <BackButton fallbackTo="/home" />
      </Box>
      <PageHeader
        title="Lista de deseos"
        action={
          <Button
            onClick={() => setIsAdding(true)}
            sx={{ minHeight: 40, px: 4, borderRadius: "999px" }}
          >
            Añadir a la lista
          </Button>
        }
        meta={data ? formatCount(data.total, "libro", "libros") : undefined}
      />
      {renderContent()}
      {isAdding && (
        <AddBookModal mode="wishlist" onClose={() => setIsAdding(false)} />
      )}
      {selectedItem && (
        <WishlistItemSheet
          key={selectedItem.id}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDone={setNotice}
        />
      )}
      <Snackbar
        open={notice !== null}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        message={notice}
      />
    </Box>
  );
};

export default WishlistPage;
