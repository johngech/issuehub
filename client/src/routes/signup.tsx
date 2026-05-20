import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "#/components/forms";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  return (
    <Flex
      className="min-h-screen px-4 py-12"
      justify={"center"}
      align={"center"}
    >
      <Box className="w-full max-w-md space-y-8">
        <Box className="text-center">
          <Heading className="text-3xl font-bold tracking-tight text-foreground">
            Create account
          </Heading>
          <Text className="mt-2 text-sm text-muted-foreground">
            Enter your details to get started
          </Text>
        </Box>

        <SignUpForm />

        <Text className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}
