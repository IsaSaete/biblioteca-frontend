import { useState } from "react";
import type { FormEvent } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "../../../../components/ui/Button/Button";
import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";
import Pill from "../../../../components/ui/Pill/Pill";

export const MAX_TAGS = 5;
const MAX_SUGGESTIONS = 6;

interface TagsEditorProps {
  tags: string[];
  // Etiquetas que el usuario ya usa en otros libros, de más a menos usadas.
  suggestions: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

const sameTag = (a: string, b: string): boolean =>
  a.toLocaleLowerCase("es") === b.toLocaleLowerCase("es");

// Etiquetas propias (HU-22): hasta 5, sin repetidos (ignorando mayúsculas). Antes
// de escribir se sugieren las más usadas; al escribir se filtran por texto y se
// excluyen las que el libro ya tiene.
const TagsEditor = ({
  tags,
  suggestions,
  onChange,
  disabled = false,
}: TagsEditorProps) => {
  const [text, setText] = useState("");
  const isFull = tags.length >= MAX_TAGS;
  const query = text.trim().toLocaleLowerCase("es");
  const visibleSuggestions = suggestions
    .filter((suggestion) => !tags.some((tag) => sameTag(tag, suggestion)))
    .filter((suggestion) => suggestion.toLocaleLowerCase("es").includes(query))
    .slice(0, MAX_SUGGESTIONS);

  const addTag = (tag: string) => {
    const clean = tag.trim();

    if (
      clean &&
      !isFull &&
      !tags.some((existing) => sameTag(existing, clean))
    ) {
      onChange([...tags, clean]);
    }
    setText("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addTag(text);
  };

  return (
    <Box sx={{ display: "grid", gap: 3, width: "100%" }}>
      <Typography component="h2" variant="caption" color="text.secondary">
        Etiquetas
      </Typography>
      {tags.length > 0 && (
        <Box
          component="ul"
          aria-label="Etiquetas del libro"
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, m: 0, p: 0 }}
        >
          {tags.map((tag) => (
            <Box
              key={tag}
              component="li"
              sx={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                borderRadius: "999px",
                border: 1,
                borderColor: "divider",
                pl: 3,
              }}
            >
              <Typography variant="caption">{tag}</Typography>
              <IconButton
                aria-label={`Quitar la etiqueta ${tag}`}
                disabled={disabled}
                onClick={() =>
                  onChange(tags.filter((existing) => existing !== tag))
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
        <Typography variant="caption" color="text.secondary">
          Has llegado al máximo de {MAX_TAGS} etiquetas.
        </Typography>
      ) : (
        <>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
          >
            <FloatingLabelInput
              label="Añadir etiqueta"
              value={text}
              disabled={disabled}
              onChange={(event) => setText(event.target.value)}
            />
            <Button type="submit" disabled={disabled || !text.trim()}>
              Añadir
            </Button>
          </Box>
          {visibleSuggestions.length > 0 && (
            <Box
              role="group"
              aria-label="Etiquetas sugeridas"
              sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
            >
              {visibleSuggestions.map((suggestion) => (
                <Pill
                  key={suggestion}
                  label={suggestion}
                  disabled={disabled}
                  onClick={() => addTag(suggestion)}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TagsEditor;
