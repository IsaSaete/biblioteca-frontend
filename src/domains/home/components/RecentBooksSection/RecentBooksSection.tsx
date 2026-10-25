import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { LibraryIcon } from "../../../../components/navigation/NavIcons";
import { useOpenAddBookModal } from "../../../../components/navigation/useOpenAddBookModal";
import Button from "../../../../components/ui/Button/Button";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import LoadingRow from "../LoadingRow/LoadingRow";
import HorizontalCarousel from "../../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import { useGetBooksQuery } from "../../../books/booksApi";
import BookCard from "../../../books/components/BookCard/BookCard";
import SectionHeader from "../SectionHeader/SectionHeader";

const TITLE = "Añadidos recientemente";
const MAX_BOOKS = 8;
const SKELETON_COUNT = 4;
const BOOK_WIDTH = 140;

// Los libros más recientes de la biblioteca (HU-32). `GET /books` ya viene
// ordenado por fecha de alta, la más reciente primero.
const RecentBooksSection = () => {
  const openAddBook = useOpenAddBookModal();
  const { data, isLoading, isError, refetch } = useGetBooksQuery();

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando tus últimos libros">
          <LoadingRow itemWidth={BOOK_WIDTH}>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <Box component="li" key={index} aria-hidden="true">
                <Skeleton
                  variant="rounded"
                  sx={{
                    aspectRatio: "2 / 3",
                    height: "auto",
                    borderRadius: 1.5,
                  }}
                />
              </Box>
            ))}
          </LoadingRow>
        </Box>
      );
    }

    if (isError || !data) {
      return (
        <InlineError
          message="No hemos podido cargar tus últimos libros."
          onRetry={() => void refetch()}
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
      <HorizontalCarousel label={TITLE} itemWidth={BOOK_WIDTH}>
        {data.items.slice(0, MAX_BOOKS).map((book) => (
          <BookCard key={book.ejemplarId} book={book} />
        ))}
      </HorizontalCarousel>
    );
  };

  return (
    <Box component="section">
      <SectionHeader
        title={TITLE}
        seeAllLabel="Ver todos"
        seeAllTo="/library"
      />
      {renderContent()}
    </Box>
  );
};

export default RecentBooksSection;
