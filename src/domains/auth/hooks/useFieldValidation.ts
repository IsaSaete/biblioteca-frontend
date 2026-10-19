import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

// Un campo solo se marca como erróneo si el usuario escribió algo y salió de
// él, o si ya tenía un error visible y lo está corrigiendo. Los campos vacíos
// solo se señalan al enviar el formulario.
export const useFieldValidation = <T extends FieldValues>({
  getValues,
  trigger,
  formState: { errors },
}: UseFormReturn<T>) => {
  return (name: Path<T>) => ({
    onBlur: async () => {
      if (getValues(name) !== "") {
        await trigger(name);
      }
    },
    onChange: async () => {
      if (errors[name]) {
        await trigger(name);
      }
    },
  });
};
