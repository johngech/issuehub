import type { SignInInput } from "@issue-tracker/core/validation";
import { signInSchema } from "@issue-tracker/core/validation";
import { Button } from "@radix-ui/themes";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { Form, FormField } from "#/components/forms";
import { FormError } from "#/components/forms/form-error";
import { useAuthForm } from "#/hooks/use-auth-form";
import { authClient } from "#/lib/auth-client";

interface SignInFormProps {
  onSuccess?: () => void;
}

const SignInForm = ({ onSuccess }: SignInFormProps) => {
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
    async (data: SignInInput) => {
      await execute(() => authClient.signIn.email(data));
    },
    [execute],
  );

  return (
    <Form
      validationSchema={signInSchema}
      initialValues={{
        email: "",
        password: "",
      }}
      onSubmit={handleSubmit}
    >
      <fieldset className="space-y-6">
        <FormError message={serverError} />

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
          autoComplete="current-password"
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </fieldset>
    </Form>
  );
};

export { SignInForm };
