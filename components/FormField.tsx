import { Controller, Control, FieldValues, Path } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  variant?: "input" | "radio" | "checkbox" | "textarea";
  options?: { value: string; label: string }[];
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  variant = "input",
  options = [],
}: FormFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {variant === "checkbox" ? (
            <div className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="label">{label}</FormLabel>
            </div>

          ) : variant === "radio" ? (
            <>
              <FormLabel className="label">{label}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <label htmlFor={option.value}>{option.label}</label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </>

          ) : variant === "textarea" ? (
            <>
              <FormLabel className="label">{label}</FormLabel>
              <FormControl>
                <Textarea
                  className="input min-h-[120px] resize-none"
                  placeholder={placeholder}
                  {...field}
                />
              </FormControl>
            </>

          ) : (
            <>
              <FormLabel className="label">{label}</FormLabel>
              <FormControl>
                <Input
                  className="input"
                  type={type}
                  placeholder={placeholder}
                  {...field}
                  onChange={(e) => {
                    const value = type === "number" ? Number(e.target.value) : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </>
          )}

          {fieldState.error && (
            <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
};

export default FormField;