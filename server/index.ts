import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { prisma } from "./prisma/client";
import { auth } from "./src/libs/auth";

const PORT = process.env.PORT || 4000;

const app = express();

// CORS — allow client dev server
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	}),
);

// Better Auth handler (Express v5 uses *splat)
app.all("/api/auth/*splat", toNodeHandler(auth));

// JSON middleware — must be AFTER Better Auth handler
app.use(express.json());

app.get("/api/health", async (_req, res) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.send({ status: "OK!", database: "connected" });
	} catch {
		res.status(500).send({ status: "ERROR", database: "disconnected" });
	}
});

app.get("/api/me", async (req, res) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) {
		return res.status(401).send({ error: "Unauthorized" });
	}
	return res.json(session);
});

app.listen(PORT, async () => {
	await prisma.$connect();
	console.log(`The app is running @ http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
	await prisma.$disconnect();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	await prisma.$disconnect();
	process.exit(0);
});
