import express from "express";
import http from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "https://paywize-assignment.fly.dev/",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("draw", (drawData) => {
      console.log("Received draw data:", drawData);
      socket.broadcast.emit("draw", drawData);
      console.log("Broadcasted draw data to other clients");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });

  app.all("*", (req, res) => nextHandler(req, res));

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
