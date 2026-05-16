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
}

const Form = <T extends FieldValues>({
  children,
  validationSchema,
  initialValues,
  onSubmit,
  className,
}: FormProps<T>) => {
  const methods = useForm<T>({
    defaultValues: initialValues,
    resolver: zodResolver(validationSchema),
    mode: "onChange",
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
};

export { Form };
