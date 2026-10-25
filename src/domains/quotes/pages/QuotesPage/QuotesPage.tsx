import { useState } from "react";
import { useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import { QuotesIcon } from "../../../../components/navigation/NavIcons";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import Button from "../../../../components/ui/Button/Button";
import ListToolbar from "../../../../components/ui/ListToolbar/ListToolbar";
import PageHeader from "../../../../components/ui/PageHeader/PageHeader";
import SortSelector from "../../../../components/ui/SortSelector/SortSelector";
import QuoteBookFilter from "../../components/QuoteBookFilter/QuoteBookFilter";
import type { QuoteFilterSelection } from "../../components/QuoteBookFilter/QuoteBookFilter";
import QuoteFormDialog from "../../components/QuoteFormDialog/QuoteFormDialog";
import SelectBookDialog from "../../components/SelectBookDialog/SelectBookDialog";
import QuotesList from "../../components/QuotesList/QuotesList";
import { useGetQuoteBooksQuery, useGetQuotesQuery } from "../../quotesApi";
import { formatQuotesMeta } from "../../utils/formatQuotesMeta";
import {
  DEFAULT_QUOTES_SORT,
  getQuotesSortOptions,
  parseQuotesSort,
} from "../../utils/quotesSort";

// Citas (HU-27, HU-28): el diario de citas, de la más reciente a la más
// antigua por defecto, filtrable por libro y ordenable (recientes, antiguas o
// por libro). Filtro y orden viven en la URL (`?bookId=`, `?sort=`) para que
// volver desde un detalle los conserve.
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

  const isFilteredByBook = Boolean(bookId) || unlinked;
  const sort = parseQuotesSort(searchParams.get("sort"), isFilteredByBook);
  // Misma consulta que la lista (comparten caché): de ahí sale el recuento.
  const { currentData: page } = useGetQuotesQuery({
    bookId,
    unlinked,
    sort: sort === DEFAULT_QUOTES_SORT ? undefined : sort,
  });

  const select = ({
    bookId: selectedId,
    unlinked: isUnlinked,
  }: QuoteFilterSelection) => {
    const next: Record<string, string> = selectedId
      ? { bookId: selectedId }
      : isUnlinked
        ? { unlinked: "true" }
        : {};
    // «Por libro» no vale con un libro elegido: si estaba puesto, se quita.
    const nextSort = parseQuotesSort(
      searchParams.get("sort"),
      Boolean(selectedId) || Boolean(isUnlinked),
    );

    if (nextSort !== DEFAULT_QUOTES_SORT) {
      next.sort = nextSort;
    }

    setSearchParams(next, { replace: true });
  };

  const changeSort = (nextSort: typeof sort) =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);

        if (nextSort === DEFAULT_QUOTES_SORT) {
          next.delete("sort");
        } else {
          next.set("sort", nextSort);
        }

        return next;
      },
      { replace: true },
    );

  // Sin citas guardadas no hay nada que ordenar.
  const hasQuotes = books.length > 0 || unlinkedCount > 0;

  return (
    <Box component="main" sx={{ maxWidth: 960, mx: "auto", p: 4, pt: 8 }}>
      <PageHeader
        title="Citas"
        meta={formatQuotesMeta({
          total: page?.total,
          bookCount: isFilteredByBook ? undefined : books.length,
        })}
        action={
          <Button
            onClick={() => setAdding({ step: "select" })}
            sx={{ minHeight: 40, px: 4, borderRadius: "999px" }}
          >
            Añadir cita
          </Button>
        }
      />
      {hasQuotes && (
        <ListToolbar
          start={
            <QuoteBookFilter
              books={books}
              unlinkedCount={unlinkedCount}
              selection={{ bookId, unlinked }}
              onSelect={select}
            />
          }
          end={
            <SortSelector
              options={getQuotesSortOptions(isFilteredByBook)}
              value={sort}
              onChange={changeSort}
            />
          }
        />
      )}
      <QuotesList
        key={`${bookId ?? ""}|${unlinked}|${sort}`}
        bookId={bookId}
        unlinked={unlinked}
        sort={sort === DEFAULT_QUOTES_SORT ? undefined : sort}
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
