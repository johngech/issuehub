import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { SignUpInput } from "@issue-tracker/core/validation";
import { signUpSchema } from "@issue-tracker/core/validation";
import { Button } from "#/components/ui/button";
import { Form, FormField } from "#/components/forms";
import { authClient } from "#/lib/auth-client";

const SignUpForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SignUpInput) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const { confirmPassword: _, ...apiPayload } = data;
      const { data: session, error: signUpError } =
        await authClient.signUp.email(apiPayload);

      if (signUpError) {
        setServerError(signUpError.message || "Failed to create account");
        return;
      }

      if (session) {
        router.invalidate();
        router.navigate({ to: "/" });
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      validationSchema={signUpSchema}
      initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        {serverError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {serverError}
          </div>
        )}

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
      </div>
    </Form>
  );
};

export { SignUpForm };
