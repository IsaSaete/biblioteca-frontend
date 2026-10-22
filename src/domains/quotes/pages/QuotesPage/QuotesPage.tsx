import { useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import { QuotesIcon } from "../../../../components/navigation/NavIcons";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import QuoteBookFilter from "../../components/QuoteBookFilter/QuoteBookFilter";
import type { QuoteFilterSelection } from "../../components/QuoteBookFilter/QuoteBookFilter";
import QuotesList from "../../components/QuotesList/QuotesList";
import { useGetQuoteBooksQuery } from "../../quotesApi";

// Citas (HU-27, HU-28): el diario de citas, de la más reciente a la más
// antigua, filtrable por libro. El filtro vive en la URL (`?bookId=`) para que
// volver desde un detalle lo conserve.
const QuotesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookId = searchParams.get("bookId") ?? undefined;
  const unlinked = searchParams.get("unlinked") === "true";
  const { data } = useGetQuoteBooksQuery();
  const books = data?.items ?? [];
  const unlinkedCount = data?.unlinkedCount ?? 0;

  const select = ({
    bookId: selectedId,
    unlinked: isUnlinked,
  }: QuoteFilterSelection) =>
    setSearchParams(
      selectedId
        ? { bookId: selectedId }
        : isUnlinked
          ? { unlinked: "true" }
          : {},
      { replace: true },
    );

  return (
    <Box component="main" sx={{ maxWidth: 480, mx: "auto", p: 4 }}>
      <Box component="h1" sx={{ fontSize: "1.1875rem", fontWeight: 500, m: 0 }}>
        Citas
      </Box>
      {(books.length > 0 || unlinkedCount > 0) && (
        <Box sx={{ my: 3 }}>
          <QuoteBookFilter
            books={books}
            unlinkedCount={unlinkedCount}
            selection={{ bookId, unlinked }}
            onSelect={select}
          />
        </Box>
      )}
      <QuotesList
        bookId={bookId}
        unlinked={unlinked}
        showBook
        empty={
          <EmptyState
            icon={<QuotesIcon />}
            title="Todavía no tienes citas"
            description="Abre un libro de tu biblioteca y guarda tu primera cita."
          />
        }
      />
    </Box>
  );
};

export default QuotesPage;
