import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type ChangeEvent, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/signin")({
	component: SignIn,
});

function SignIn() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: ChangeEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const { data, error: signInError } = await authClient.signIn.email({
			email,
			password,
		});

		setIsLoading(false);

		if (signInError) {
			setError(signInError.message || "Invalid email or password");
			return;
		}

		if (data) {
			router.invalidate();
			void router.navigate({ to: "/" });
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Sign in
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Enter your credentials to access your account
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{error && (
						<div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							autoComplete="email"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
						</div>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="current-password"
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Signing in..." : "Sign in"}
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						to="/signup"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
