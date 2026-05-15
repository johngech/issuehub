import express from "express";
import { prisma } from "./prisma/client";

const PORT = process.env.PORT || 4000;

const app = express();

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.send({ status: "OK!", database: "connected" });
  } catch {
    res.status(500).send({ status: "ERROR", database: "disconnected" });
  }
});

app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`The app is running @ http://localhost:${PORT}`);
});
