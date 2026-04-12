import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { initializeDatabase } from "./db/schema.js";
import { loadLocalEnv } from "./lib/env.js";
import liveRoutes from "./routes/liveRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import { registerLiveExamSocket } from "./socket/liveExamSocket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadLocalEnv();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", database: Boolean(process.env.DATABASE_URL) ? "configured" : "memory" });
});

app.use("/api/quizzes", quizRoutes);
app.use("/api/live", liveRoutes);

// Serve static files from frontend/dist
const frontendDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

// SPA fallback: serve index.html for all non-API routes
app.get(/^(?!\/api|\/socket\.io).*/, (_request, response) => {
  response.sendFile(path.join(frontendDistPath, "index.html"));
});

registerLiveExamSocket(io);

const PORT = process.env.PORT || 4000;

await initializeDatabase();

server.listen(PORT, () => {
  console.log(`Umbrella quiz backend running on port ${PORT}`);

  const networkUrls = Object.values(os.networkInterfaces())
    .flat()
    .filter((address) => address && address.family === "IPv4" && !address.internal)
    .map((address) => `http://${address.address}:${PORT}`);

  if (networkUrls.length > 0) {
    console.log("Available on local network:");
    networkUrls.forEach((url) => console.log(`  ${url}`));
  }
});
