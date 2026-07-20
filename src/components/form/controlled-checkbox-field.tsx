import { useController, type Control, type FieldPathByValue, type FieldValues } from "react-hook-form";
import { CheckboxField } from "@/components/form/checkbox-field";

type Props<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPathByValue<TValues, boolean>;
  label: React.ReactNode;
  description?: string;
  className?: string;
  id?: string;
};

export function ControlledCheckboxField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  id,
}: Props<TValues>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <CheckboxField
      id={id}
      label={label}
      description={description}
      checked={Boolean(field.value)}
      className={className}
      error={fieldState.error?.message}
      registration={{
        name: field.name,
        ref: field.ref,
        onBlur: async () => field.onBlur(),
        onChange: async (event) => field.onChange(event.target.checked),
      }}
    />
  );
}
