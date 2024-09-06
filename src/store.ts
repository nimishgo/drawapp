"use client";

import { create } from "zustand";
import io from "socket.io-client";
const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
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
socket.on("connect", () => {
  console.log("Connected to server", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
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
  updateShape: (index: number, shape: Shape) => void;
  undo: () => void;
  redo: () => void;
  emitDraw: (shape: Shape) => void;
  receiveDrawing: (callback: (shape: Shape) => void) => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  tool: "pen",
  shapeType: "rectangle",
  color: "#000000",
  brushSize: 5,
  shapes: [],
  history: [],
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
  updateShape: (index, shape) =>
    set((state) => {
      const newShapes = [...state.shapes];
      newShapes[index] = shape;
      return { shapes: newShapes };
    }),
  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          shapes: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    }),
  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          shapes: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    }),
  emitDraw: (shape) => {
    console.log("Emitting draw event:", shape);
    socket.emit("draw", shape);
  },

  receiveDrawing: (callback: (shape: Shape) => void) => {
    socket.on("draw", (shape: Shape) => {
      console.log("Received draw event:", shape);
      callback(shape); // Keep the callback if needed for additional processing
      set((state) => {
        const newShapes = [...state.shapes, shape];
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newShapes);
        return {
          shapes: newShapes,
          history: newHistory,
          historyIndex: state.historyIndex + 1,
        };
      });
    });
  },
}));
