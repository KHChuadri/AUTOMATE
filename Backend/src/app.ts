import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "OK" }));

  app.use('/api', authRoutes);

  return app;
}
