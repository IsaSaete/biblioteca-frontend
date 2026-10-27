import { useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import HorizontalCarousel from "../../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import InlineError from "../../../../components/ui/InlineError/InlineError";
import BookCard from "../../../books/components/BookCard/BookCard";
import WishlistItemSheet from "../../../wishlist/components/WishlistItemSheet/WishlistItemSheet";
import type { WishlistItem } from "../../../wishlist/dto/WishlistItem";
import { useGetWishlistQuery } from "../../../wishlist/wishlistApi";
import LoadingRow from "../LoadingRow/LoadingRow";
import SectionHeader from "../SectionHeader/SectionHeader";

const TITLE = "Quiero tener";
const MAX_ITEMS = 6;
const SKELETON_COUNT = 4;
const BOOK_WIDTH = { xs: 160, sm: 180 };
// Las portadas son 2:3 (alto / ancho), para centrar las flechas en ellas.
const COVER_RATIO = 1.5;
// Con ratón: libros completos por página (tablet y escritorio).
const BOOKS_PER_PAGE = { sm: 4, md: 5 };

// Los últimos libros guardados en «Quiero tener» (HU-43, D-036). No cuentan en las
// cifras. Sin deseados la sección no desaparece: así la función se descubre.
const WishlistSection = () => {
  const { data, isLoading, isError, refetch } = useGetWishlistQuery();
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box role="status" aria-label="Cargando tu lista Quiero tener">
          <LoadingRow itemWidth={BOOK_WIDTH} itemsPerPage={BOOKS_PER_PAGE}>
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
          message="No hemos podido cargar tu lista Quiero tener."
          onRetry={() => void refetch()}
        />
      );
    }

    if (data.items.length === 0) {
      return (
        <Box sx={{ bgcolor: "background.paper", borderRadius: 1.5, p: 4 }}>
          <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
            Apunta aquí los libros que quieres conseguir. Cuando los tengas,
            pásalos a tu biblioteca.
          </Typography>
        </Box>
      );
    }

    return (
      <HorizontalCarousel
        label={TITLE}
        itemWidth={BOOK_WIDTH}
        itemsPerPage={BOOKS_PER_PAGE}
        mediaRatio={COVER_RATIO}
      >
        {data.items.slice(0, MAX_ITEMS).map((item) => (
          <BookCard
            key={item.id}
            book={item.book}
            onSelect={() => setSelectedItem(item)}
          />
        ))}
      </HorizontalCarousel>
    );
  };

  return (
    <Box component="section">
      <SectionHeader
        title={TITLE}
        seeAllLabel="Ver todos"
        seeAllTo="/wishlist"
      />
      {renderContent()}
      {selectedItem && (
        <WishlistItemSheet
          key={selectedItem.id}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </Box>
  );
};

export default WishlistSection;
