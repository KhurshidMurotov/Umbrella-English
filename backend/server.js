import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import os from "node:os";
import { Server } from "socket.io";
import liveRoutes from "./routes/liveRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import { registerLiveExamSocket } from "./socket/liveExamSocket.js";

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
  response.json({ status: "ok" });
});

app.use("/api/quizzes", quizRoutes);
app.use("/api/live", liveRoutes);

registerLiveExamSocket(io);

const PORT = process.env.PORT || 4000;

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
