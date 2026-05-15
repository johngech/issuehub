import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { auth } from "./src/lib/auth";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

// CORS — allow client dev server
app.use(
	cors({
		origin: true,
		credentials: true,
	}),
);

app.use(express.json());

// Better Auth handler (Express v5 uses *any)
app.all("/api/auth/*any", toNodeHandler(auth));

app.get("/api/health", async (_req, res) => {
	try {
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
	console.log(`The app is running @ http://localhost:${PORT}`);
});
