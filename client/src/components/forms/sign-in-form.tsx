import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { SignInInput } from "@issue-tracker/core/validation";
import { signInSchema } from "@issue-tracker/core/validation";
import { Button } from "#/components/ui/button";
import { Form, FormField } from "#/components/forms";
import { authClient } from "#/lib/auth-client";

const SignInForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SignInInput) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const { data: session, error: signInError } =
        await authClient.signIn.email(data);

      if (signInError) {
        setServerError(signInError.message || "Invalid email or password");
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
      validationSchema={signInSchema}
      initialValues={{ email: "", password: "" }}
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        {serverError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {serverError}
          </div>
        )}

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
      </div>
    </Form>
  );
};

export { SignInForm };
