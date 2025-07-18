import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

type SubmitButtonProps = {
  label: string;
  loading: React.ReactNode;
  className?: string;
};

export default function SubmitButton({
  label,
  loading,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" className={className}>
      {pending ? loading : label}
    </Button>
  );
}
