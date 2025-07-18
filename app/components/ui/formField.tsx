import { Label } from "./label";
import { Input } from "./input";
import { FieldError } from "./formError";
import type { FormState } from "@/auth/validations/formState";

interface FormFieldProps {
  label: string;
  inputName: string;
  id: string;
  placeholder: string;
  inputType: "text" | "password" | "email";
  fieldErrors: FormState["fieldErrors"];
}

export default function FormField({
  label,
  inputName,
  id,
  inputType,
  fieldErrors,
  placeholder,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={inputName}
        type={inputType}
        placeholder={placeholder}
        className={`pr-10 transition-all duration-200 ${
          fieldErrors[inputName]
            ? "border-red-500 focus:ring-red-500"
            : "focus:ring-blue-500"
        }`}
      />

      <FieldError fieldErrors={fieldErrors} name={inputName} />
    </div>
  );
}
