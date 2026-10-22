import { useState } from "react";
import { useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import { QuotesIcon } from "../../../../components/navigation/NavIcons";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import Pill from "../../../../components/ui/Pill/Pill";
import QuoteBookFilter from "../../components/QuoteBookFilter/QuoteBookFilter";
import type { QuoteFilterSelection } from "../../components/QuoteBookFilter/QuoteBookFilter";
import QuoteFormDialog from "../../components/QuoteFormDialog/QuoteFormDialog";
import SelectBookDialog from "../../components/SelectBookDialog/SelectBookDialog";
import QuotesList from "../../components/QuotesList/QuotesList";
import { useGetQuoteBooksQuery } from "../../quotesApi";

// Citas (HU-27, HU-28): el diario de citas, de la más reciente a la más
// antigua, filtrable por libro. El filtro vive en la URL (`?bookId=`) para que
// volver desde un detalle lo conserve.
type AddQuote =
  | { step: "select" }
  | { step: "form"; ejemplarId?: string; bookTitle?: string };

const QuotesPage = () => {
  const [adding, setAdding] = useState<AddQuote | null>(null);
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
      <Box
        sx={{
          my: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        {books.length > 0 || unlinkedCount > 0 ? (
          <QuoteBookFilter
            books={books}
            unlinkedCount={unlinkedCount}
            selection={{ bookId, unlinked }}
            onSelect={select}
          />
        ) : (
          <span />
        )}
        <Pill
          label="+ Añadir cita"
          onClick={() => setAdding({ step: "select" })}
        />
      </Box>
      <QuotesList
        bookId={bookId}
        unlinked={unlinked}
        showBook
        empty={
          <EmptyState
            icon={<QuotesIcon />}
            title="Todavía no tienes citas"
            description="Guarda la primera con el botón «Añadir cita»."
          />
        }
      />
      {adding?.step === "select" && (
        <SelectBookDialog
          onSelect={(book) =>
            setAdding({
              step: "form",
              ejemplarId: book?.ejemplarId,
              bookTitle: book?.title,
            })
          }
          onClose={() => setAdding(null)}
        />
      )}
      {adding?.step === "form" && (
        <QuoteFormDialog
          ejemplarId={adding.ejemplarId}
          bookTitle={adding.bookTitle}
          onClose={() => setAdding(null)}
        />
      )}
    </Box>
  );
};

export default QuotesPage;
