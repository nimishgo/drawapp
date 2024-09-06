"use client";

import React from "react";
import { useDrawingStore } from "../store";

const Toolbar: React.FC = () => {
  const {
    tool,
    setTool,
    color,
    setColor,
    brushSize,
    setBrushSize,
    undo,
    redo,
    shapeType,
    setShapeType,
    shapes,
  } = useDrawingStore();

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  return (
    <div className="mb-4 flex flex-wrap space-x-4">
      <select
        value={tool}
        onChange={(e) =>
          setTool(e.target.value as "pen" | "eraser" | "shape" | "text")
        }
        className="border p-2 rounded"
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
        <option value="shape">Shape</option>
        <option value="text">Text</option>
      </select>
      {tool === "shape" && (
        <select
          value={shapeType}
          onChange={(e) =>
            setShapeType(e.target.value as "rectangle" | "circle")
          }
          className="border p-2 rounded"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      )}
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-10"
      />
      <input
        type="range"
        min="1"
        max="20"
        value={brushSize}
        onChange={(e) => setBrushSize(parseInt(e.target.value))}
        className="w-32"
      />
      <button
        onClick={handleUndo}
        disabled={shapes.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        Undo
      </button>
      <button
        onClick={handleRedo}
        disabled={true} // Disable redo for now as we don't have redo stack in the current implementation
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        Redo
      </button>
    </div>
  );
};

export default Toolbar;
