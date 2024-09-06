"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDrawingStore, Point, Shape } from "../store";

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const {
    shapes,
    tool,
    color,
    brushSize,
    addShape,
    updateShape,
    shapeType,
    fontSize,
    emitDraw,
    receiveDrawing,
    forceUpdate,
  } = useDrawingStore();

  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<Point | null>(null);

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Shape) => {
      ctx.beginPath();
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineWidth = shape.brushSize;
      console.log("Drawing shape:", shape);
      if (!shape || !shape.type || !shape.points || shape.points.length === 0) {
        console.error("Invalid shape data:", shape);
        return;
      }
      switch (shape.type) {
        case "path":
          console.log("path is rendered ");
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach((point) => ctx.lineTo(point.x, point.y));
          ctx.stroke();
          break;
        case "line":
          console.log("line should be rendered");
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          ctx.lineTo(shape.points[1].x, shape.points[1].y);
          ctx.stroke();
          break;
        case "rectangle":
          console.log("rectangle should be rendered");
          const [start, end] = shape.points;
          ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
          ctx.stroke();
          break;
        case "circle":
          const [center, radiusPoint] = shape.points;
          const radius = Math.sqrt(
            Math.pow(radiusPoint.x - center.x, 2) +
              Math.pow(radiusPoint.y - center.y, 2),
          );
          ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case "text":
          if (shape.text) {
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText(shape.text, shape.points[0].x, shape.points[0].y);
          }
          break;
      }
    },
    [fontSize],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleReceivedDrawing = (shape: Shape) => {
      addShape(shape);
    };

    receiveDrawing(handleReceivedDrawing);

    return () => {
      // Clean up the event listener
      receiveDrawing(() => {});
    };
  }, [addShape, receiveDrawing]);

  useEffect(() => {
    console.log("Shapes updated:", shapes);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        console.log("Clearing canvas and redrawing shapes");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach((shape, index) => {
          console.log(`Drawing shape ${index}:`, shape);
          drawShape(ctx, shape);
        });
      } else {
        console.error("Could not get 2D context from canvas");
      }
    } else {
      console.error("Canvas ref is null");
    }
  }, [shapes, drawShape, forceUpdate]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (tool === "pen" || tool === "eraser") {
      const newShape: Shape = {
        type: "path",
        color: tool === "eraser" ? "#FFFFFF" : color,
        brushSize: tool === "eraser" ? 20 : brushSize,
        points: [{ x, y }],
      };
      addShape(newShape);
    } else if (tool === "text") {
      setTextPosition({ x, y });
      setTextInput("");
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "pen" || tool === "eraser") {
      const lastShapeIndex = shapes.length - 1;
      const lastShape = shapes[lastShapeIndex];
      if (lastShape && lastShape.type === "path") {
        const updatedShape = {
          ...lastShape,
          points: [...lastShape.points, { x, y }],
        };
        updateShape(lastShapeIndex, updatedShape);
      }
    } else if (startPoint && tool === "shape") {
      const shape: Shape = {
        type: shapeType,
        color,
        brushSize,
        points: [startPoint, { x, y }],
      };

      const lastShapeIndex = shapes.length - 1;
      const lastShape = shapes[lastShapeIndex];

      if (lastShape && lastShape.type === shapeType && isDrawing) {
        updateShape(lastShapeIndex, shape);
      } else {
        addShape(shape);
      }
    }
  };

  const endDrawing = () => {
    if (isDrawing && startPoint) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const x = startPoint.x;
      const y = startPoint.y;

      const shape: Shape = {
        type: tool === "shape" ? shapeType : "path",
        color,
        brushSize,
        points: [startPoint, { x, y }],
        text: tool === "text" ? textInput : undefined,
      };

      addShape(shape);
      emitDraw(shape); // Emit the draw event
    }

    setIsDrawing(false);
    setStartPoint(null);
    setTextInput("");
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && textPosition) {
      const newShape: Shape = {
        type: "text",
        color,
        brushSize: fontSize,
        points: [textPosition],
        text: textInput,
      };
      addShape(newShape);
      setTextInput("");
      setTextPosition(null);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className="border border-gray-300"
      />
      {textPosition && (
        <input
          type="text"
          value={textInput}
          onChange={handleTextInput}
          onKeyDown={handleTextInputKeyDown}
          style={{
            position: "absolute",
            left: textPosition.x,
            top: textPosition.y,
            font: `${fontSize}px Arial`,
            color: color,
          }}
          autoFocus
        />
      )}
    </div>
  );
};

export default Canvas;
