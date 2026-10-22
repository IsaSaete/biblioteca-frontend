import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { useOnVisible } from "../../../../hooks/useOnVisible";
import { useGetQuotesQuery } from "../../quotesApi";
import QuoteCard from "../QuoteCard/QuoteCard";

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
  showBook: boolean;
  // Qué mostrar si no hay ninguna cita.
  empty: ReactNode;
}

interface QuotesChunkProps {
  bookId?: string;
  unlinked?: boolean;
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
  showBook,
  cursor,
  isLast,
  onLoadMore,
}: QuotesChunkProps) => {
  const { data, isFetching, isError, refetch } = useGetQuotesQuery({
    bookId,
    unlinked,
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
      {data.items.map((quote) => (
        <Box component="li" key={quote.id} sx={{ listStyle: "none" }}>
          <QuoteCard quote={quote} showBook={showBook} />
        </Box>
      ))}
      {isFetching && <LoadingQuotes count={2} />}
      {isLast && nextCursor && (
        <LoadMoreSentinel onVisible={() => onLoadMore(nextCursor)} />
      )}
    </>
  );
};

// Citas de la más reciente a la más antigua con scroll infinito, para el feed
// y para las citas de un libro.
const QuotesList = ({ bookId, unlinked, showBook, empty }: QuotesListProps) => {
  const { data, isLoading, isError, refetch } = useGetQuotesQuery({
    bookId,
    unlinked,
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
        sx={{ m: 0, p: 0, display: "grid", gap: 3 }}
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
    <Box
      component="ul"
      aria-label="Citas"
      sx={{ m: 0, p: 0, display: "grid", gap: 3 }}
    >
      {data.items.map((quote) => (
        <Box component="li" key={quote.id} sx={{ listStyle: "none" }}>
          <QuoteCard quote={quote} showBook={showBook} />
        </Box>
      ))}
      {moreCursors.length === 0 && data.nextCursor && (
        <LoadMoreSentinel onVisible={() => loadMore(data.nextCursor ?? "")} />
      )}
      {moreCursors.map((cursor, index) => (
        <QuotesChunk
          key={cursor}
          bookId={bookId}
          unlinked={unlinked}
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
