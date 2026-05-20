import type { SignUpInput } from "@issue-tracker/core/validation";
import { signUpSchema } from "@issue-tracker/core/validation";
import { Button } from "@radix-ui/themes";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { Form, FormField } from "#/components/forms";
import { FormError } from "#/components/forms/form-error";
import { useAuthForm } from "#/hooks/use-auth-form";
import { authClient } from "#/lib/auth-client";

interface SignUpFormProps {
  onSuccess?: () => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const router = useRouter();

  const handleSuccess = useCallback(() => {
    router.invalidate();
    if (onSuccess) {
      onSuccess();
    } else {
      router.navigate({
        to: "/",
      });
    }
  }, [router, onSuccess]);

  const { serverError, isLoading, execute } = useAuthForm({
    onSuccess: handleSuccess,
  });

  const handleSubmit = useCallback(
    async (data: SignUpInput) => {
      const { confirmPassword: _omit, ...apiPayload } = data;
      await execute(() => authClient.signUp.email(apiPayload));
    },
    [execute],
  );

  return (
    <Form
      validationSchema={signUpSchema}
      initialValues={{
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      }}
      onSubmit={handleSubmit}
    >
      <fieldset className="space-y-6">
        <FormError message={serverError} />

        <FormField
          name="name"
          label="Name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
        />

        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />

        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <FormField
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </fieldset>
    </Form>
  );
};

export { SignUpForm };
