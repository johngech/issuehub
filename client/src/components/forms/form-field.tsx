import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "#/components/ui/input";

interface FormFieldProps extends ComponentProps<typeof Input> {
  name: string;
}

const FormField = ({ name, ...props }: FormFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return <Input errorText={error} {...props} {...register(name)} />;
};

export { FormField };
