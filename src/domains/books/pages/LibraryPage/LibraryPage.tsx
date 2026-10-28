import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { LibraryIcon } from "../../../../components/navigation/NavIcons";
import { useOpenAddBookModal } from "../../../../components/navigation/useOpenAddBookModal";
import Button from "../../../../components/ui/Button/Button";
import ListToolbar from "../../../../components/ui/ListToolbar/ListToolbar";
import PageHeader from "../../../../components/ui/PageHeader/PageHeader";
import SortSelector from "../../../../components/ui/SortSelector/SortSelector";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import LoadingCovers from "../../../../components/ui/LoadingCovers/LoadingCovers";
import LoadMoreSentinel from "../../../../components/ui/LoadMoreSentinel/LoadMoreSentinel";
import WishlistLink from "../../../wishlist/components/WishlistLink/WishlistLink";
import { formatCount } from "../../../../utils/formatCount";
import { useGetBooksQuery } from "../../booksApi";
import type { GetBooksParams } from "../../dto/GetBooksParams";
import type { LibraryView } from "../../dto/LibraryView";
import { useLibraryView } from "../../hooks/useLibraryView";
import BookCard from "../../components/BookCard/BookCard";
import BookRow from "../../components/BookRow/BookRow";
import BooksGrid from "../../components/BooksGrid/BooksGrid";
import BooksList from "../../components/BooksList/BooksList";
import ViewToggle from "../../components/ViewToggle/ViewToggle";
import ActiveFilters from "../../components/ActiveFilters/ActiveFilters";
import FiltersButton from "../../components/FiltersButton/FiltersButton";
import FiltersSheet from "../../components/FiltersSheet/FiltersSheet";
import {
  hasActiveFilters,
  NO_FILTERS,
  parseLibraryFilters,
  sortOptions,
  toBooksParams,
  toSearchParams,
} from "../../utils/libraryFilters";
import type { LibraryFilters } from "../../utils/libraryFilters";
import { useAnchoredPanel } from "../../../../hooks/useAnchoredPanel";

const SKELETON_COUNT = 10;
const SKELETON_ROWS = 6;

interface BooksChunkProps {
  params?: GetBooksParams;
  view: LibraryView;
  cursor: string;
  isLast: boolean;
  onLoadMore: (cursor: string) => void;
}

// Una tanda de 24 libros a partir de un cursor. Cada tanda es su propia
// consulta, así que la caché y las recargas por invalidación no mezclan
// páginas (RTK Query no calcula páginas: se encadenan con `nextCursor`).
const BooksChunk = ({
  params,
  view,
  cursor,
  isLast,
  onLoadMore,
}: BooksChunkProps) => {
  const { data, isFetching, isError, refetch } = useGetBooksQuery({
    ...params,
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
    return <LoadingBooks view={view} count={3} />;
  }

  const { nextCursor } = data;

  return (
    <>
      {data.items.map((book) =>
        view === "list" ? (
          <BookRow key={book.ejemplarId} book={book} />
        ) : (
          <BookCard key={book.ejemplarId} book={book} />
        ),
      )}
      {isFetching && <LoadingBooks view={view} count={3} />}
      {isLast && nextCursor && (
        <LoadMoreSentinel onVisible={() => onLoadMore(nextCursor)} />
      )}
    </>
  );
};

const LoadingRows = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Box
        component="li"
        key={index}
        sx={{ listStyle: "none", py: 3 }}
        aria-hidden="true"
      >
        <Skeleton variant="rounded" sx={{ height: 84, borderRadius: 1.5 }} />
      </Box>
    ))}
  </>
);

const LoadingBooks = ({ view, count }: { view: LibraryView; count: number }) =>
  view === "list" ? (
    <LoadingRows count={count} />
  ) : (
    <LoadingCovers count={count} />
  );

interface LibraryGridProps {
  params?: GetBooksParams;
  view: LibraryView;
  isFiltered: boolean;
  onClearFilters: () => void;
}

// El grid de una combinación de orden y filtros. Se vuelve a montar cuando
// cambian (`key`), así que las tandas ya cargadas de otra combinación no se
// mezclan con las nuevas.
const LibraryGrid = ({
  params,
  view,
  isFiltered,
  onClearFilters,
}: LibraryGridProps) => {
  const [moreCursors, setMoreCursors] = useState<string[]>([]);
  const openAddBook = useOpenAddBookModal();
  const { data, isLoading, isError, refetch } = useGetBooksQuery(params);

  const loadMore = useCallback(
    (cursor: string) =>
      setMoreCursors((cursors) =>
        cursors.includes(cursor) ? cursors : [...cursors, cursor],
      ),
    [],
  );

  const Container = view === "list" ? BooksList : BooksGrid;

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando tu biblioteca">
          <Container isPlaceholder>
            <LoadingBooks
              view={view}
              count={view === "list" ? SKELETON_ROWS : SKELETON_COUNT}
            />
          </Container>
        </Box>
      );
    }

    if (isError || !data) {
      return (
        <InlineError
          message="No hemos podido cargar tu biblioteca."
          onRetry={() => void refetch()}
        />
      );
    }

    if (data.items.length === 0 && isFiltered) {
      return (
        <EmptyState
          icon={<LibraryIcon />}
          title="Ningún libro coincide con estos filtros"
          action={<Button onClick={onClearFilters}>Quitar filtros</Button>}
        />
      );
    }

    if (data.items.length === 0) {
      return (
        <EmptyState
          icon={<LibraryIcon />}
          title="Tu estantería está vacía, de momento"
          action={<Button onClick={openAddBook}>Añadir tu primer libro</Button>}
        />
      );
    }

    return (
      <Container>
        {data.items.map((book) =>
          view === "list" ? (
            <BookRow key={book.ejemplarId} book={book} />
          ) : (
            <BookCard key={book.ejemplarId} book={book} />
          ),
        )}
        {moreCursors.length === 0 && data.nextCursor && (
          <LoadMoreSentinel onVisible={() => loadMore(data.nextCursor ?? "")} />
        )}
        {moreCursors.map((cursor, index) => (
          <BooksChunk
            key={cursor}
            params={params}
            view={view}
            cursor={cursor}
            isLast={index === moreCursors.length - 1}
            onLoadMore={loadMore}
          />
        ))}
      </Container>
    );
  };

  return renderContent();
};

// Biblioteca en grid de portadas (HU-09) con scroll infinito, estado vacío
// (HU-14), y orden y filtros (HU-12, HU-13). Orden y filtros viven en la URL
// (`?sort=&favorite=&tag=&untagged=`) para que volver desde una ficha, o llegar
// desde «Favoritos» de Inicio, los conserve.
const LibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtersPanel = useAnchoredPanel();
  const filters = parseLibraryFilters(searchParams);
  const params = toBooksParams(filters);
  const isFiltered = hasActiveFilters(filters);
  const { view, setView } = useLibraryView();
  const { data, currentData } = useGetBooksQuery(params);
  // Con la biblioteca vacía no hay nada que ordenar ni filtrar.
  const hasToolbar =
    isFiltered || (data !== undefined && data.items.length > 0);
  const total = currentData?.total;
  const activeCount =
    Number(filters.favorite) + Number(filters.untagged || Boolean(filters.tag));

  const update = (next: Partial<LibraryFilters>) =>
    setSearchParams(toSearchParams({ ...filters, ...next }), { replace: true });

  return (
    <Box component="main" sx={{ maxWidth: 960, mx: "auto", p: 4, pt: 8 }}>
      <PageHeader
        title="Biblioteca"
        meta={
          total === undefined
            ? undefined
            : formatCount(total, "libro", "libros")
        }
      />
      <WishlistLink />
      {hasToolbar && (
        <ListToolbar
          start={
            <FiltersButton
              activeCount={activeCount}
              isExpanded={filtersPanel.isOpen}
              onClick={filtersPanel.open}
            />
          }
          end={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SortSelector
                options={sortOptions}
                value={filters.sort}
                onChange={(sort) => update({ sort })}
              />
              <ViewToggle view={view} onChange={setView} />
            </Box>
          }
        />
      )}
      {isFiltered && <ActiveFilters selection={filters} onChange={update} />}
      <LibraryGrid
        key={toSearchParams(filters).toString()}
        params={params}
        view={view}
        isFiltered={isFiltered}
        onClearFilters={() => update(NO_FILTERS)}
      />
      <FiltersSheet
        open={filtersPanel.isOpen}
        anchorEl={filtersPanel.anchorEl}
        selection={filters}
        total={total}
        onChange={update}
        onClose={filtersPanel.close}
      />
    </Box>
  );
};

export default LibraryPage;
