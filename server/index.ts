import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { auth } from "./src/lib/auth";
import { errorHandler } from "./src/middleware/error-handler";
import { usersRouter } from "./src/routes/users";

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

// Better Auth handler — MUST be before express.json()
app.all("/api/auth/*any", toNodeHandler(auth));

app.use(express.json());

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    res.send({
      status: "OK!",
      database: "connected",
    });
  } catch {
    res.status(500).send({
      status: "ERROR",
      database: "disconnected",
    });
  }
});

// User management routes
app.use("/api", usersRouter);

// Centralized error handler (must be last)
app.use(errorHandler);

if (import.meta.main) {
  app.listen(PORT, async () => {
    console.log(`The app is running @ http://localhost:${PORT}`);
  });
}

export { app };
