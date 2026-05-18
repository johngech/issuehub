import { createFileRoute, Link } from "@tanstack/react-router";
import { SignInForm } from "#/components/forms";
import { Box, Heading, Text } from "@radix-ui/themes";

export const Route = createFileRoute("/signin")({
  component: SignIn,
});

function SignIn() {
  return (
    <Box className="flex min-h-screen items-center justify-center px-4 py-12">
      <Box className="w-full max-w-md space-y-8">
        <Box className="text-center">
          <Heading className="text-3xl font-bold tracking-tight text-foreground">
            Sign in
          </Heading>
          <Text className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </Text>
        </Box>

        <SignInForm />

        <Text className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
