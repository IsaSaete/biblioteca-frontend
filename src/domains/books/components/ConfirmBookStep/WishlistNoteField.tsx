import FloatingLabelInput from "../../../../components/ui/FloatingLabelInput/FloatingLabelInput";

const MAX_NOTE_LENGTH = 500;

interface WishlistNoteFieldProps {
  value: string;
  onChange: (note: string) => void;
}

// Nota opcional de un libro de la lista de deseos.
const WishlistNoteField = ({ value, onChange }: WishlistNoteFieldProps) => (
  <FloatingLabelInput
    label="Nota (opcional)"
    multiline
    minRows={2}
    fullWidth
    value={value}
    onChange={(event) => onChange(event.target.value)}
    helperText={`${value.length}/${MAX_NOTE_LENGTH}`}
    slotProps={{ htmlInput: { maxLength: MAX_NOTE_LENGTH } }}
  />
);

export default WishlistNoteField;
