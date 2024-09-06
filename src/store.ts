"use client";

import { create } from "zustand";
import io from "socket.io-client";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://paywize-assignment.fly.dev/",
);

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  type: string;
  color: string;
  brushSize: number;
  points: Point[];
  text?: string;
}

interface DrawingState {
  tool: "pen" | "eraser" | "shape" | "text";
  shapeType: "rectangle" | "circle";
  color: string;
  brushSize: number;
  shapes: Shape[];
  history: Shape[][];
  historyIndex: number;
  fontSize: number;
  setTool: (tool: DrawingState["tool"]) => void;
  setShapeType: (shapeType: DrawingState["shapeType"]) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  addShape: (shape: Shape) => void;
  setShapes: (shapes: Shape[]) => void;
  updateShape: (index: number, shape: Shape) => void;
  undo: () => void;
  redo: () => void;
  emitDraw: (shape: Shape) => void;
  clearShapes: () => void;
  forceUpdate: number;
  triggerForceUpdate: () => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  tool: "pen",
  shapeType: "rectangle",
  color: "#000000",
  brushSize: 5,
  shapes: [],
  history: [],
  forceUpdate: 0,
  historyIndex: -1,
  fontSize: 36,
  setTool: (tool) => set({ tool }),
  setShapeType: (shapeType) => set({ shapeType }),
  setColor: (color) => set({ color }),
  setBrushSize: (brushSize) => set({ brushSize }),
  addShape: (shape) =>
    set((state) => {
      const newShapes = [...state.shapes, shape];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newShapes);
      return {
        shapes: newShapes,
        history: newHistory,
        historyIndex: state.historyIndex + 1,
      };
    }),
  setShapes: (shapes) => set({ shapes }),
  updateShape: (index, shape) =>
    set((state) => {
      const newShapes = [...state.shapes];
      newShapes[index] = shape;
      return { shapes: newShapes };
    }),
  undo: () => {
    socket.emit("undo");
  },
  redo: () => {
    socket.emit("redo");
  },
  emitDraw: (shape) => {
    console.log("Emitting draw event:", shape);
    socket.emit("draw", shape);
  },
  clearShapes: () => {
    set({ shapes: [], history: [], historyIndex: -1 });
    socket.emit("clear");
  },
  triggerForceUpdate: () =>
    set((state) => ({ forceUpdate: state.forceUpdate + 1 })),
}));

socket.on("connect", () => {
  console.log("Connected to server", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("initial_shapes", (initialShapes: Shape[]) => {
  useDrawingStore.getState().setShapes(initialShapes);
});

socket.on("update_shapes", (updatedShapes: Shape[]) => {
  useDrawingStore.getState().setShapes(updatedShapes);
});

socket.on("draw", (shape: Shape) => {
  useDrawingStore.getState().addShape(shape);
});

socket.on("clear_canvas", () => {
  useDrawingStore.getState().clearShapes();
});
