import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { LibraryIcon } from "../../../../components/navigation/NavIcons";
import { useOpenAddBookModal } from "../../../../components/navigation/useOpenAddBookModal";
import Button from "../../../../components/ui/Button/Button";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { visuallyHidden } from "../../../../utils/visuallyHidden";
import { useGetBooksQuery } from "../../booksApi";
import type { GetBooksParams } from "../../dto/GetBooksParams";
import BookCard from "../../components/BookCard/BookCard";
import BooksGrid from "../../components/BooksGrid/BooksGrid";
import ActiveFilters from "../../components/ActiveFilters/ActiveFilters";
import FiltersButton from "../../components/FiltersButton/FiltersButton";
import FiltersSheet from "../../components/FiltersSheet/FiltersSheet";
import SortSelector from "../../../../components/ui/SortSelector/SortSelector";
import {
  hasActiveFilters,
  NO_FILTERS,
  parseLibraryFilters,
  sortOptions,
  toBooksParams,
  toSearchParams,
} from "../../utils/libraryFilters";
import type { LibraryFilters } from "../../utils/libraryFilters";
import { useOnVisible } from "../../../../hooks/useOnVisible";

const SKELETON_COUNT = 9;

const LoadMoreSentinel = ({ onVisible }: { onVisible: () => void }) => {
  const ref = useOnVisible(onVisible);
  return (
    <Box
      component="li"
      ref={ref}
      aria-hidden="true"
      sx={{ gridColumn: "1 / -1", height: 1 }}
    />
  );
};

interface BooksChunkProps {
  params?: GetBooksParams;
  cursor: string;
  isLast: boolean;
  onLoadMore: (cursor: string) => void;
}

// Una tanda de 24 libros a partir de un cursor. Cada tanda es su propia
// consulta, así que la caché y las recargas por invalidación no mezclan
// páginas (RTK Query no calcula páginas: se encadenan con `nextCursor`).
const BooksChunk = ({
  params,
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
    return <LoadingCovers count={3} />;
  }

  const { nextCursor } = data;

  return (
    <>
      {data.items.map((book) => (
        <BookCard key={book.ejemplarId} book={book} />
      ))}
      {isFetching && <LoadingCovers count={3} />}
      {isLast && nextCursor && (
        <LoadMoreSentinel onVisible={() => onLoadMore(nextCursor)} />
      )}
    </>
  );
};

const LoadingCovers = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Box
        component="li"
        key={index}
        sx={{ listStyle: "none" }}
        aria-hidden="true"
      >
        <Skeleton
          variant="rounded"
          sx={{ aspectRatio: "2 / 3", height: "auto", borderRadius: 1.5 }}
        />
      </Box>
    ))}
  </>
);

interface LibraryGridProps {
  params?: GetBooksParams;
  isFiltered: boolean;
  onClearFilters: () => void;
}

// El grid de una combinación de orden y filtros. Se vuelve a montar cuando
// cambian (`key`), así que las tandas ya cargadas de otra combinación no se
// mezclan con las nuevas.
const LibraryGrid = ({
  params,
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando tu biblioteca">
          <BooksGrid isPlaceholder>
            <LoadingCovers count={SKELETON_COUNT} />
          </BooksGrid>
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
      <BooksGrid>
        {data.items.map((book) => (
          <BookCard key={book.ejemplarId} book={book} />
        ))}
        {moreCursors.length === 0 && data.nextCursor && (
          <LoadMoreSentinel onVisible={() => loadMore(data.nextCursor ?? "")} />
        )}
        {moreCursors.map((cursor, index) => (
          <BooksChunk
            key={cursor}
            params={params}
            cursor={cursor}
            isLast={index === moreCursors.length - 1}
            onLoadMore={loadMore}
          />
        ))}
      </BooksGrid>
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filters = parseLibraryFilters(searchParams);
  const params = toBooksParams(filters);
  const isFiltered = hasActiveFilters(filters);
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
    <Box component="main" sx={{ maxWidth: 960, mx: "auto", p: 4 }}>
      <Box component="h1" sx={visuallyHidden}>
        Biblioteca
      </Box>
      {hasToolbar && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
            mb: isFiltered ? 2 : 4,
          }}
        >
          <SortSelector
            options={sortOptions}
            value={filters.sort}
            onChange={(sort) => update({ sort })}
          />
          <FiltersButton
            activeCount={activeCount}
            onClick={() => setIsFiltersOpen(true)}
          />
        </Box>
      )}
      {isFiltered && (
        <ActiveFilters selection={filters} total={total} onChange={update} />
      )}
      <LibraryGrid
        key={toSearchParams(filters).toString()}
        params={params}
        isFiltered={isFiltered}
        onClearFilters={() => update(NO_FILTERS)}
      />
      <FiltersSheet
        open={isFiltersOpen}
        selection={filters}
        total={total}
        onChange={update}
        onClose={() => setIsFiltersOpen(false)}
      />
    </Box>
  );
};

export default LibraryPage;
