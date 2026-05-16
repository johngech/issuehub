import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "#/components/forms";

export const Route = createFileRoute("/signup")({
	component: SignUp,
});

function SignUp() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Create account
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Enter your details to get started
					</p>
				</div>

				<SignUpForm />

				<p className="text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						to="/signin"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
