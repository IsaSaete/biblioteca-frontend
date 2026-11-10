import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import { landingContent } from "../../content/landingContent";
import { ownedBooks, pileBooks, wishlistBooks } from "../../content/shelfBooks";
import type { ShelfBook, SpineColor } from "../../content/shelfBooks";
import { themeVars } from "../../themeVars";

const { shelf } = landingContent;

// En pantallas pequeñas la balda se escala y los lomos opcionales se ocultan
// (el montón tumbado se queda a cambio de algún lomo).
const COMPACT_QUERY = "@media (max-width: 559.95px)";
// Menos de 360 px: la balda pierde también la lista de deseos.
const NARROW_QUERY = "@media (max-width: 359.95px)";
// Menos de 440 px: se esconden dos lomos más para que quepa el montón.
const TINY_QUERY = "@media (max-width: 439.95px)";
// Pantallas de 360 px o menos de 400: un poco más pequeña para que quepa.
const SMALL_QUERY = "@media (max-width: 399.95px)";

const spineColor = (theme: Theme, color: SpineColor) => ({
  background: themeVars(theme).palette.landing[`spine${color}`],
  text: themeVars(theme).palette.landing[`onSpine${color}`],
});

// Las bandas del lomo toman el color del texto del libro (`currentColor`): claras
// sobre los lomos oscuros y oscuras sobre los claros, donde unas líneas blancas
// no se verían.
const BAND_STRONG = "color-mix(in srgb, currentColor 38%, transparent)";
const BAND_SOFT = "color-mix(in srgb, currentColor 22%, transparent)";

const paperBands = `
  linear-gradient(to bottom, transparent 16px, ${BAND_STRONG} 16px, ${BAND_STRONG} 18px, transparent 18px, transparent 22px, ${BAND_SOFT} 22px, ${BAND_SOFT} 23px, transparent 23px),
  linear-gradient(to top, transparent 16px, ${BAND_STRONG} 16px, ${BAND_STRONG} 18px, transparent 18px)
`;

// Libro tumbado: tapas de 5 px, lomo de 7 px y 3 px de tapa que sobresale por el
// canto de las hojas (medidas de escritorio, escaladas con `--k`).
const lyingBookBackground = (cover: string, pages: string) => {
  const solid = `linear-gradient(${cover}, ${cover})`;
  const pagesArea =
    "calc(7px * var(--k)) calc(5px * var(--k)) / calc(100% - 10px * var(--k)) calc(100% - 10px * var(--k)) no-repeat";

  return `
    ${solid} top left / 100% calc(5px * var(--k)) no-repeat,
    ${solid} bottom left / 100% calc(5px * var(--k)) no-repeat,
    ${solid} left / calc(7px * var(--k)) 100% no-repeat,
    repeating-linear-gradient(to bottom, transparent 0 2px, rgba(43,38,32,.14) 2px 3px) ${pagesArea},
    linear-gradient(${pages}, ${pages}) ${pagesArea}
  `;
};

interface SpineProps {
  book: ShelfBook;
  wished?: boolean;
}

const Spine = ({ book, wished = false }: SpineProps) => {
  const sx: SxProps<Theme> = (theme) => {
    const colors = book.color ? spineColor(theme, book.color) : undefined;

    return {
      position: "relative",
      flex: "0 0 auto",
      display: "grid",
      placeItems: "center",
      height: `calc(${book.height}px * var(--k))`,
      width: `calc(${book.width}px * var(--k))`,
      borderRadius: "3px 3px 1px 1px",
      transition: "transform 180ms ease-out",
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      "&:hover": { transform: "translateY(-14px)" },
      ...(book.leaning && {
        transform: "rotate(-8deg)",
        transformOrigin: "bottom left",
        ml: "calc(30px * var(--k))",
        mr: "calc(10px * var(--k))",
      }),
      ...(book.optional && { [COMPACT_QUERY]: { display: "none" } }),
      ...(book.tiny && { [TINY_QUERY]: { display: "none" } }),
      ...(wished
        ? {
            color: themeVars(theme).palette.text.secondary,
            border: `2px dashed ${themeVars(theme).palette.landing.dashed}`,
            borderBottom: 0,
            "&:hover": {
              transform: "translateY(-14px)",
              borderColor: themeVars(theme).palette.primary.main,
              color: themeVars(theme).palette.text.primary,
            },
          }
        : {
            bgcolor: colors?.background,
            color: colors?.text,
            backgroundImage: paperBands,
            boxShadow:
              "inset -4px 0 0 rgba(0,0,0,.14), inset 2px 0 0 rgba(255,255,255,.14), 0 1px 0 rgba(0,0,0,.08)",
          }),
    };
  };

  return (
    <Box component="li" sx={sx}>
      <Box
        component="span"
        sx={(theme) => ({
          ...theme.typography.landingDisplay,
          writingMode: "vertical-rl",
          fontSize: "calc(18px * var(--k))",
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        })}
      >
        {book.title}
      </Box>
      {book.label && (
        <Box
          component="span"
          sx={{
            position: "absolute",
            bottom: "calc(28px * var(--k))",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(22px * var(--k))",
            height: "calc(26px * var(--k))",
            borderRadius: "1px",
            bgcolor: "#F7F5F1",
            backgroundImage: "linear-gradient(#2B2620, #2B2620)",
            backgroundPosition: "50% 32%",
            backgroundSize: "60% 1.5px",
            backgroundRepeat: "no-repeat",
            "&::after": {
              content: '""',
              position: "absolute",
              left: "20%",
              right: "20%",
              top: "58%",
              height: "1.5px",
              bgcolor: "#2B2620",
              opacity: 0.55,
            },
          }}
        />
      )}
    </Box>
  );
};

const Bookshelf = () => (
  <Box
    role="img"
    aria-label={shelf.label}
    sx={{ position: "relative", pt: 10, overflowX: "clip" }}
  >
    <Box
      component="ul"
      aria-hidden="true"
      sx={(theme) => ({
        "--k": 1,
        [theme.breakpoints.down("lg")]: { "--k": 0.9 },
        [theme.breakpoints.down("md")]: { "--k": 0.66 },
        [theme.breakpoints.down("sm")]: { "--k": 0.48 },
        [COMPACT_QUERY]: { "--k": 0.62 },
        [SMALL_QUERY]: { "--k": 0.55 },
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "3px",
        m: 0,
        px: 1,
        listStyle: "none",
        minHeight: "calc(300px * var(--k))",
        borderBottom: `10px solid ${themeVars(theme).palette.landing.plank}`,
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-10px",
          height: "10px",
          boxShadow: "0 10px 14px -8px rgba(43,38,32,.25)",
          pointerEvents: "none",
        },
      })}
    >
      {ownedBooks.map((book) => (
        <Spine key={book.title} book={book} />
      ))}
      <Box
        component="li"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 0.5,
          alignSelf: "flex-end",
          ml: 2,
        }}
      >
        {pileBooks.map((pile) => (
          <Box
            key={`${pile.width}-${pile.color}`}
            component="span"
            // Libro tumbado visto de frente: las dos tapas y el lomo (a la
            // izquierda) en el color del libro, y entre ellos el canto de las
            // hojas, que termina un poco antes que las tapas.
            sx={(theme) => {
              const { pages } = themeVars(theme).palette.landing;
              const darkCover = pile.darkColor
                ? spineColor(theme, pile.darkColor).background
                : undefined;

              return {
                display: "block",
                height: "calc(34px * var(--k))",
                width: `calc(${pile.width}px * var(--k))`,
                borderRadius: "2px",
                background: lyingBookBackground(
                  spineColor(theme, pile.color).background,
                  pages,
                ),
                ...(darkCover &&
                  theme.applyStyles("dark", {
                    background: lyingBookBackground(darkCover, pages),
                  })),
              };
            }}
          />
        ))}
      </Box>
      <Box
        component="li"
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          gap: "3px",
          ml: "calc(36px * var(--k))",
          // Móvil: los de la lista de deseos se van al otro extremo de la balda,
          // y la estantería queda repartida de lado a lado.
          [COMPACT_QUERY]: { ml: "auto" },
          // 320 px: sin sitio para los libros de la lista de deseos y su nota,
          // que se quedan en pantallas algo mayores.
          [NARROW_QUERY]: { display: "none" },
        }}
      >
        <Box
          component="span"
          sx={(theme) => ({
            ...theme.typography.landingNote,
            position: "absolute",
            left: 0,
            bottom: "calc(100% + 26px)",
            color: themeVars(theme).palette.landing.note,
            transform: "rotate(-2deg)",
            transformOrigin: "left bottom",
            whiteSpace: "nowrap",
            "&::after": {
              content: '""',
              position: "absolute",
              left: "14px",
              top: "calc(100% + 4px)",
              width: "1px",
              height: "14px",
              bgcolor: themeVars(theme).palette.landing.note,
              opacity: 0.7,
            },
            [theme.breakpoints.down("md")]: {
              left: "auto",
              right: "-2px",
              transformOrigin: "right bottom",
              "&::after": { left: "auto", right: "22px" },
            },
          })}
        >
          {shelf.wishlistNote}
        </Box>
        {wishlistBooks.map((book) => (
          <Spine key={book.title} book={book} wished />
        ))}
      </Box>
    </Box>
  </Box>
);

export default Bookshelf;
