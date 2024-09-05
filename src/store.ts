import { create } from "zustand";

interface DrawingState {
  tool: "pen" | "eraser" | "shape" | "text";
  color: string;
  brushSize: number;
  shapes: any[];
  history: any[][];
  historyIndex: number;

  setTool: (tool: DrawingState["tool"]) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  addShape: (shape: any) => void;
  updateShape: (index: number, shape: any) => void;
  undo: () => void;
  redo: () => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  tool: "pen",
  color: "#000000",
  brushSize: 5,
  shapes: [],
  history: [],
  historyIndex: -1,

  setTool: (tool) => set({ tool }),
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
}));
