import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { capitalizeFirst } from "../../utils/capitalizeFirst";
import { GENRES, MAX_GENRES } from "../../utils/genres";

interface GenresEditorProps {
  genres: string[];
  onChange: (genres: string[]) => void;
  error?: string;
  disabled?: boolean;
}

// «poesia» y «Poesía» son el mismo género: se ignoran mayúsculas y acentos.
const comparable = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");

const sameGenre = (a: string, b: string): boolean =>
  comparable(a) === comparable(b);

// Un texto propio que coincide con un género del catálogo es ese género.
const toGenre = (text: string): string => {
  const clean = text.trim();

  return (
    GENRES.find((genre) => sameGenre(genre, clean)) ?? capitalizeFirst(clean)
  );
};

interface GenreOption {
  genre: string;
  // Texto propio que no está en el catálogo.
  isCustom: boolean;
}

const sortedGenres = [...GENRES].sort((a, b) => a.localeCompare(b, "es"));

// Géneros del libro: hasta 3, de una lista cerrada que se busca escribiendo, y
// si no está, se puede añadir uno propio. Mantener la lista cerrada es lo que
// permite filtrar por género sin que «novela», «Novela» y «Fiction» sean tres
// cosas distintas. Lo libre va en las etiquetas. Los cambios se guardan con el
// resto del formulario.
const GenresEditor = ({
  genres,
  onChange,
  error,
  disabled = false,
}: GenresEditorProps) => {
  const [text, setText] = useState("");
  const isFull = genres.length >= MAX_GENRES;
  const options: GenreOption[] = sortedGenres
    .filter((genre) => !genres.some((selected) => sameGenre(selected, genre)))
    .map((genre) => ({ genre, isCustom: false }));

  const addGenre = (genre: string) => {
    if (
      genre &&
      !isFull &&
      !genres.some((selected) => sameGenre(selected, genre))
    ) {
      onChange([...genres, genre]);
    }
  };

  // Lo que coincide con lo escrito, y al final «añadir lo escrito» si no es ya
  // un género del catálogo ni uno de los elegidos.
  const filterOptions = (
    available: GenreOption[],
    { inputValue }: { inputValue: string },
  ): GenreOption[] => {
    const typed = inputValue.trim();
    const matches = available.filter((option) =>
      comparable(option.genre).includes(comparable(typed)),
    );
    const isKnown =
      GENRES.some((genre) => sameGenre(genre, typed)) ||
      genres.some((selected) => sameGenre(selected, typed));

    return typed && !isKnown
      ? [...matches, { genre: toGenre(typed), isCustom: true }]
      : matches;
  };

  return (
    <Box
      role="group"
      aria-label="Géneros"
      sx={{ display: "grid", gap: 4, width: "100%" }}
    >
      <Typography
        component="h3"
        sx={{ fontSize: "0.875rem" }}
        color="text.secondary"
      >
        Géneros
      </Typography>
      {genres.length > 0 && (
        <Box
          component="ul"
          aria-label="Géneros del libro"
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, m: 0, p: 0 }}
        >
          {genres.map((genre) => (
            <Box
              key={genre}
              component="li"
              sx={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                borderRadius: "999px",
                border: 1,
                borderColor: "primary.main",
                color: "secondary.contrastText",
                pl: 3,
              }}
            >
              <Typography sx={{ fontSize: "0.875rem" }}>{genre}</Typography>
              <IconButton
                aria-label={`Quitar el género ${genre}`}
                disabled={disabled}
                onClick={() =>
                  onChange(genres.filter((existing) => existing !== genre))
                }
                sx={{ width: 44, height: 44 }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      {isFull ? (
        <Typography sx={{ fontSize: "0.875rem" }} color="text.secondary">
          Has llegado al máximo de {MAX_GENRES} géneros.
        </Typography>
      ) : (
        <Autocomplete
          fullWidth
          autoHighlight
          openOnFocus
          disabled={disabled}
          options={options}
          value={null}
          inputValue={text}
          // El texto solo se conserva mientras se escribe: al elegir una opción
          // (`selectOption`), al salir del campo o al limpiarlo, queda vacío.
          onInputChange={(_event, value, reason) =>
            setText(reason === "input" ? value : "")
          }
          onChange={(_event, option) => {
            if (option) {
              addGenre(option.genre);
            }
          }}
          filterOptions={filterOptions}
          getOptionLabel={(option) => option.genre}
          isOptionEqualToValue={(a, b) => a.genre === b.genre}
          noOptionsText="Ningún género coincide."
          slotProps={{
            // El fondo del modal y la superficie del listado casi no se
            // distinguen (#FFFFFF y #F7F5F1): el borde, igual que el de los
            // campos, y la sombra separan la lista del formulario.
            paper: {
              elevation: 8,
              sx: { border: 1, borderColor: "text.secondary", mt: 1 },
            },
            // Con el teclado abierto en móvil queda poco alto: unas cinco filas,
            // con su separador, y se desplaza el resto.
            listbox: {
              sx: {
                maxHeight: 240,
                "& .MuiAutocomplete-option": {
                  minHeight: 48,
                  "&:not(:last-of-type)": {
                    borderBottom: 1,
                    borderColor: "divider",
                  },
                },
              },
            },
          }}
          renderOption={({ key, ...props }, option) => (
            <li key={key} {...props}>
              {option.isCustom
                ? `Añadir «${option.genre}» como género propio`
                : option.genre}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar género"
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  sx: { borderRadius: "6px", minHeight: 44 },
                },
              }}
            />
          )}
        />
      )}
      {error && (
        <Typography sx={{ fontSize: "0.875rem" }} color="error">
          {error}
        </Typography>
      )}
      {genres.length === 0 && (
        <Typography sx={{ fontSize: "0.875rem" }} color="text.secondary">
          Si no eliges ninguno, el libro se queda sin género.
        </Typography>
      )}
    </Box>
  );
};

export default GenresEditor;
