import express from "express";
import http from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

let shapes = [];
let undoStack = [];

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

    // Send current shapes to the newly connected client
    socket.emit("initial_shapes", shapes);

    socket.on("draw", (shape) => {
      console.log("Received draw data:", shape);
      shapes.push(shape);
      undoStack = []; // Clear redo stack on new draw
      socket.broadcast.emit("draw", shape);
    });

    socket.on("undo", () => {
      if (shapes.length > 0) {
        const undoneShape = shapes.pop();
        undoStack.push(undoneShape);
        io.emit("update_shapes", shapes);
      }
    });

    socket.on("redo", () => {
      if (undoStack.length > 0) {
        const redoneShape = undoStack.pop();
        shapes.push(redoneShape);
        io.emit("update_shapes", shapes);
      }
    });

    socket.on("clear", () => {
      shapes = [];
      undoStack = [];
      io.emit("clear_canvas");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });

  app.all("*", (req, res) => nextHandler(req, res));

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
