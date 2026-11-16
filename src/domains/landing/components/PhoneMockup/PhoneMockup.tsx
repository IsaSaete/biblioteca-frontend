import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { capitalizeWords } from "../../../books/utils/capitalizeFirst";
import type { DemoBook } from "../../content/demoLibrary";
import {
  countBooks,
  getTagLabel,
  matchesSelection,
} from "../../utils/demoFilters";
import type { DemoSelection } from "../../utils/demoFilters";
import { themeVars } from "../../themeVars";
import DemoFiltersSheet, {
  SHEET_ID,
} from "../DemoFiltersSheet/DemoFiltersSheet";

const APP_FONT = '"Inter", system-ui, sans-serif';
const QUOTE_FONT = '"Lora", Georgia, serif';

const icon = {
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const navItems = [
  {
    label: "Inicio",
    active: false,
    path: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  },
  {
    label: "Biblioteca",
    active: true,
    path: "M4 4h4v16H4zM10 4h4v16h-4zM16.5 6.5l3.5 1-3 12-3.5-1z",
  },
  {
    label: "Citas",
    active: false,
    path: "M7 7h4v5a4 4 0 0 1-4 4M15 7h4v5a4 4 0 0 1-4 4",
  },
  {
    label: "Perfil",
    active: false,
    path: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0",
  },
];

interface PhoneMockupProps {
  books: DemoBook[];
  selection: DemoSelection;
  isSheetOpen: boolean;
  onSelectionChange: (selection: DemoSelection) => void;
  onSheetOpenChange: (open: boolean) => void;
}

// Réplica de la pantalla Biblioteca de la app, con las proporciones de un
// teléfono real. El botón «Filtros» abre la misma hoja que la app; el resto es
// decorativo y la información útil la anuncia la sección.
const PhoneMockup = ({
  books,
  selection,
  isSheetOpen,
  onSelectionChange,
  onSheetOpenChange,
}: PhoneMockupProps) => {
  // Como en la app: con filtros solo se ven los libros que coinciden.
  const visible = books.filter((book) => matchesSelection(book, selection));
  const filtersButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Al abrir la hoja el foco entra en ella; al cerrarla vuelve al botón.
  useEffect(() => {
    if (isSheetOpen) {
      closeButtonRef.current?.focus();
    } else if (wasOpen.current) {
      filtersButtonRef.current?.focus();
    }
    wasOpen.current = isSheetOpen;
  }, [isSheetOpen]);

  const activeChips = [
    ...(selection.favorite
      ? [
          {
            label: "Favoritos",
            remove: () => onSelectionChange({ ...selection, favorite: false }),
          },
        ]
      : []),
    ...(selection.lent
      ? [
          {
            label: "Prestados",
            remove: () => onSelectionChange({ ...selection, lent: false }),
          },
        ]
      : []),
    ...(selection.tag
      ? [
          {
            label: capitalizeWords(getTagLabel(selection.tag)),
            remove: () => onSelectionChange({ ...selection, tag: undefined }),
          },
        ]
      : []),
  ];

  return (
    <Box
      role="group"
      aria-label="Ejemplo de la biblioteca de Glosa"
      sx={(theme) => ({
        // Desde escritorio, un teléfono con sus proporciones reales. En móvil
        // ya se está en un teléfono: queda solo la pantalla, como una tarjeta
        // con las portadas, sin marco ni barra de navegación.
        position: "relative",
        width: { xs: "100%", md: 292 },
        height: { xs: "auto", md: 612 },
        // Sitio para la hoja «Filtros» también en la tarjeta del móvil.
        minHeight: { xs: 460, md: 0 },
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: {
          xs: 0,
          md: `9px solid ${themeVars(theme).palette.text.primary}`,
        },
        borderRadius: { xs: "12px", md: "44px" },
        bgcolor: { xs: "background.paper", md: "background.default" },
        color: "text.primary",
        fontFamily: APP_FONT,
        lineHeight: 1.35,
        boxShadow: { xs: "none", md: "0 30px 50px -34px rgba(43,38,32,.55)" },
      })}
    >
      <Box
        sx={(theme) => ({
          position: "relative",
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "hidden",
          px: 3.5,
          pt: { xs: 4, md: 3 },
          // En móvil la tarjeta enseña todos los libros: nada queda cortado.
          pb: { xs: 4, md: 0 },
          "&::before": {
            display: { xs: "none", md: "block" },
            content: '""',
            position: "absolute",
            top: 8,
            left: "50%",
            width: 70,
            height: 20,
            ml: "-35px",
            borderRadius: "12px",
            bgcolor: themeVars(theme).palette.text.primary,
          },
        })}
      >
        <Box
          aria-hidden="true"
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "space-between",
            fontSize: 11,
            fontWeight: 500,
            px: 2,
            pt: 1,
            pb: 4,
          }}
        >
          <span>9:41</span>
        </Box>
        <Box
          component="p"
          aria-hidden="true"
          sx={{ m: 0, fontSize: 19, fontWeight: 500 }}
        >
          Biblioteca
        </Box>
        <Box
          component="p"
          aria-hidden="true"
          sx={{ m: 0, mb: 3, fontSize: 11, color: "text.secondary" }}
        >
          {countBooks(visible.length)}
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            borderRadius: "10px",
            px: 3,
            py: 2,
            fontSize: 12.5,
            mb: 2.5,
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 24 24"
            {...icon}
            sx={{ color: "primary.main", width: 16, height: 16 }}
          >
            <path d="M19.5 12V4.5A1.5 1.5 0 0 0 18 3H6.5A2.5 2.5 0 0 0 4 5.5v12A2.5 2.5 0 0 0 6.5 20H11M8 3v17" />
            <path
              d="M17.5 21.5s-4.5-2.7-4.5-5.8a2.4 2.4 0 0 1 4.5-1.1 2.4 2.4 0 0 1 4.5 1.1c0 3.1-4.5 5.8-4.5 5.8z"
              fill="currentColor"
              strokeWidth={1}
            />
          </Box>
          <span>Lista de deseos</span>
          <Box component="span" sx={{ ml: "auto", color: "text.secondary" }}>
            ›
          </Box>
        </Box>
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            fontWeight: 500,
            px: 0.5,
            mb: 2,
            borderTop: `1px solid ${themeVars(theme).palette.landing.line}`,
            borderBottom: `1px solid ${themeVars(theme).palette.landing.line}`,
          })}
        >
          <Box
            ref={filtersButtonRef}
            component="button"
            type="button"
            aria-expanded={isSheetOpen}
            aria-controls={isSheetOpen ? SHEET_ID : undefined}
            onClick={() => onSheetOpenChange(true)}
            sx={{
              minHeight: 44,
              px: 1,
              ml: -1,
              fontSize: "inherit",
              fontWeight: "inherit",
              fontFamily: "inherit",
              color: "primary.main",
              bgcolor: "transparent",
              border: 0,
              cursor: "pointer",
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
              },
            }}
          >
            Filtros
          </Box>
          <Box
            component="span"
            aria-hidden="true"
            sx={{ display: { xs: "none", md: "inline" } }}
          >
            Orden
          </Box>
        </Box>
        {activeChips.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
            {activeChips.map((chip) => (
              <Box
                key={chip.label}
                component="button"
                type="button"
                aria-label={`Quitar el filtro ${chip.label}`}
                onClick={chip.remove}
                sx={(theme) => ({
                  minHeight: 44,
                  px: 2.5,
                  fontSize: 11.5,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  borderRadius: "999px",
                  border: `1px solid ${themeVars(theme).palette.primary.main}`,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                })}
              >
                {chip.label} <span aria-hidden="true">✕</span>
              </Box>
            ))}
          </Box>
        )}
        <Box
          component="ul"
          aria-hidden="true"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "12px 8px",
            listStyle: "none",
            m: 0,
            p: 0,
          }}
        >
          {visible.map((book) => {
            return (
              <Box key={book.title} component="li" sx={{ minWidth: 0 }}>
                <Box
                  sx={(theme) => ({
                    aspectRatio: "2 / 3",
                    display: "grid",
                    placeItems: "center",
                    p: 1.5,
                    borderRadius: "4px",
                    bgcolor:
                      themeVars(theme).palette.landing[`spine${book.color}`],
                    color:
                      themeVars(theme).palette.landing[`onSpine${book.color}`],
                    boxShadow:
                      "0 5px 8px -5px rgba(0,0,0,.4), inset -3px 0 0 rgba(0,0,0,.12)",
                  })}
                >
                  <Box
                    component="span"
                    sx={{
                      fontFamily: QUOTE_FONT,
                      fontStyle: "italic",
                      fontSize: 10.5,
                      textAlign: "center",
                      lineHeight: 1.2,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {book.title}
                  </Box>
                </Box>
                <Box
                  component="b"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    mt: 1,
                    fontSize: 10.5,
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {book.title}
                </Box>
                <Box
                  component="small"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontSize: 9.5,
                    color: "text.secondary",
                    lineHeight: 1.2,
                  }}
                >
                  {book.author}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          flex: "0 0 auto",
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: "repeat(5, 1fr)",
          alignItems: "end",
          px: 1,
          pt: 1.5,
          pb: 2.5,
          bgcolor: "background.default",
          borderTop: `1px solid ${themeVars(theme).palette.landing.line}`,
        })}
      >
        {navItems.slice(0, 2).map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
        <Box
          component="span"
          sx={{
            position: "relative",
            top: "-10px",
            justifySelf: "center",
            width: 32,
            height: 40,
            pt: 2,
            display: "grid",
            placeItems: "start center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          +
        </Box>
        {navItems.slice(2).map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </Box>
      {isSheetOpen && (
        <DemoFiltersSheet
          ref={closeButtonRef}
          selection={selection}
          total={visible.length}
          onChange={onSelectionChange}
          onClose={() => onSheetOpenChange(false)}
        />
      )}
    </Box>
  );
};

const NavItem = ({ label, active, path }: (typeof navItems)[number]) => (
  <Box
    component="span"
    sx={{
      display: "grid",
      justifyItems: "center",
      gap: 0.5,
      fontSize: 9,
      color: active ? "primary.main" : "text.secondary",
    }}
  >
    <Box component="svg" viewBox="0 0 24 24" {...icon}>
      <path d={path} />
    </Box>
    {label}
  </Box>
);

export default PhoneMockup;
