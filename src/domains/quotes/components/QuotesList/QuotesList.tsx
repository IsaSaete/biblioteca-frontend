import { Fragment, useCallback, useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { useOnVisible } from "../../../../hooks/useOnVisible";
import { useGetQuotesQuery } from "../../quotesApi";
import type { QuotesSort } from "../../dto/GetQuotesParams";
import type { Quote } from "../../dto/Quote";
import { isGroupedByBook } from "../../utils/quotesSort";
import QuoteCard from "../QuoteCard/QuoteCard";

// Una columna en móvil, dos en tablet y tres en escritorio, sin saltos de
// breakpoint: caben tantas columnas de 280px como permita el ancho.
const gridSx = {
  m: 0,
  p: 0,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 3,
} as const;

const getGroupKey = (quote: Quote): string => quote.book?.id ?? "none";

// Cabecera de un grupo al ordenar por libro: título y autores, o «Sin libro».
const QuoteGroupHeading = ({
  quote,
  isFirst,
}: {
  quote: Quote;
  isFirst: boolean;
}) => (
  <Box
    component="li"
    sx={{ listStyle: "none", gridColumn: "1 / -1", mt: isFirst ? 0 : 3 }}
  >
    <Typography component="h3" sx={{ fontWeight: 500 }}>
      {quote.book?.title ?? "Sin libro"}
    </Typography>
    {quote.book && (
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
        {quote.book.authors.join(", ")}
      </Typography>
    )}
  </Box>
);

interface QuoteItemsProps {
  items: Quote[];
  showBook: boolean;
  // Con orden por libro, una cabecera por libro; el pie de cada tarjeta ya no
  // repite el título (salvo en las citas sin libro, que muestran su fuente).
  grouped: boolean;
  isFirstChunk: boolean;
}

const QuoteItems = ({
  items,
  showBook,
  grouped,
  isFirstChunk,
}: QuoteItemsProps) => (
  <>
    {items.map((quote, index) => {
      const previous = items[index - 1];
      // Cada tanda empieza con su cabecera: así, si un libro continúa en la
      // siguiente, se sabe de cuál es.
      const startsGroup =
        grouped && (!previous || getGroupKey(previous) !== getGroupKey(quote));

      return (
        <Fragment key={quote.id}>
          {startsGroup && (
            <QuoteGroupHeading
              quote={quote}
              isFirst={isFirstChunk && index === 0}
            />
          )}
          <Box component="li" sx={{ listStyle: "none", display: "flex" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <QuoteCard
                quote={quote}
                showBook={grouped ? !quote.book : showBook}
              />
            </Box>
          </Box>
        </Fragment>
      );
    })}
  </>
);

const LoadMoreSentinel = ({ onVisible }: { onVisible: () => void }) => {
  const ref = useOnVisible(onVisible);

  return <Box component="li" ref={ref} aria-hidden="true" sx={{ height: 1 }} />;
};

const LoadingQuotes = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Box component="li" key={index} sx={{ listStyle: "none" }} aria-hidden>
        <Skeleton variant="rounded" sx={{ height: 96, borderRadius: 1.5 }} />
      </Box>
    ))}
  </>
);

interface QuotesListProps {
  // Sin `bookId`, el feed de todas las citas.
  bookId?: string;
  // Solo las citas sin libro (no se combina con `bookId`).
  unlinked?: boolean;
  sort?: QuotesSort;
  showBook: boolean;
  // Qué mostrar si no hay ninguna cita.
  empty: ReactNode;
}

interface QuotesChunkProps {
  bookId?: string;
  unlinked?: boolean;
  sort?: QuotesSort;
  showBook: boolean;
  cursor: string;
  isLast: boolean;
  onLoadMore: (cursor: string) => void;
}

// Una tanda de 24 citas a partir de un cursor. Cada tanda es su propia
// consulta (mismo patrón que la Biblioteca): la caché y las recargas por
// invalidación no mezclan páginas.
const QuotesChunk = ({
  bookId,
  unlinked,
  sort,
  showBook,
  cursor,
  isLast,
  onLoadMore,
}: QuotesChunkProps) => {
  const { data, isFetching, isError, refetch } = useGetQuotesQuery({
    bookId,
    unlinked,
    sort,
    cursor,
  });

  if (isError) {
    return (
      <Box component="li" sx={{ listStyle: "none" }}>
        <InlineError
          message="No hemos podido cargar más citas."
          onRetry={() => void refetch()}
        />
      </Box>
    );
  }

  if (!data) {
    return <LoadingQuotes count={2} />;
  }

  const { nextCursor } = data;

  return (
    <>
      <QuoteItems
        items={data.items}
        showBook={showBook}
        grouped={sort !== undefined && isGroupedByBook(sort)}
        isFirstChunk={false}
      />
      {isFetching && <LoadingQuotes count={2} />}
      {isLast && nextCursor && (
        <LoadMoreSentinel onVisible={() => onLoadMore(nextCursor)} />
      )}
    </>
  );
};

// Citas con scroll infinito (por defecto, de la más reciente a la más antigua),
// para el feed y para las citas de un libro. Hay que volver a montarla cuando
// cambian el filtro o el orden (`key`): un cursor solo vale para el orden con el
// que se pidió.
const QuotesList = ({
  bookId,
  unlinked,
  sort,
  showBook,
  empty,
}: QuotesListProps) => {
  const { data, isLoading, isError, refetch } = useGetQuotesQuery({
    bookId,
    unlinked,
    sort,
  });
  const [moreCursors, setMoreCursors] = useState<string[]>([]);

  const loadMore = useCallback(
    (cursor: string) =>
      setMoreCursors((cursors) =>
        cursors.includes(cursor) ? cursors : [...cursors, cursor],
      ),
    [],
  );

  if (isLoading) {
    return (
      <Box
        component="ul"
        role="status"
        aria-label="Cargando las citas"
        sx={gridSx}
      >
        <LoadingQuotes count={3} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <InlineError
        message="No hemos podido cargar las citas."
        onRetry={() => void refetch()}
      />
    );
  }

  if (data.items.length === 0) {
    return <>{empty}</>;
  }

  return (
    <Box component="ul" aria-label="Citas" sx={gridSx}>
      <QuoteItems
        items={data.items}
        showBook={showBook}
        grouped={sort !== undefined && isGroupedByBook(sort)}
        isFirstChunk
      />
      {moreCursors.length === 0 && data.nextCursor && (
        <LoadMoreSentinel onVisible={() => loadMore(data.nextCursor ?? "")} />
      )}
      {moreCursors.map((cursor, index) => (
        <QuotesChunk
          key={cursor}
          bookId={bookId}
          unlinked={unlinked}
          sort={sort}
          showBook={showBook}
          cursor={cursor}
          isLast={index === moreCursors.length - 1}
          onLoadMore={loadMore}
        />
      ))}
    </Box>
  );
};

export default QuotesList;
