import { FormState } from "@/auth/validations/formState";

type FieldErrorProps = {
  fieldErrors: FormState["fieldErrors"];
  name: string;
};

const FieldError = ({ fieldErrors, name }: FieldErrorProps) => {
  return <span className="text-xs text-red-400">{fieldErrors[name]?.[0]}</span>;
};

export { FieldError };
