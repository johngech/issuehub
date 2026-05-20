import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SignInForm } from "#/components/forms";

export const Route = createFileRoute("/signin")({
  component: SignIn,
});

function SignIn() {
  return (
    <Flex
      className="min-h-screen px-4 py-12"
      justify={"center"}
      align={"center"}
    >
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
    </Flex>
  );
}
