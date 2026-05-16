import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

interface FormProps<T extends FieldValues> {
  children: ReactNode;
  validationSchema: z.ZodType<T, any, any>;
  initialValues: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  className?: string;
  mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
}

const Form = <T extends FieldValues>({
  children,
  validationSchema,
  initialValues,
  onSubmit,
  className,
  mode = "onTouched",
}: FormProps<T>) => {
  const methods = useForm<T>({
    defaultValues: initialValues,
    resolver: zodResolver(validationSchema),
    mode,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
};

export { Form };
