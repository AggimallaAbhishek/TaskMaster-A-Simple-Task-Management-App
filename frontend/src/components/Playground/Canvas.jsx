import React, { useRef, useEffect, useCallback } from 'react';
import { COLORS } from '../../styles/theme';

/**
 * Canvas - Renders Matter.js bodies to HTML5 Canvas
 *
 * Features:
 * - Renders circles and rectangles
 * - Shows grid background
 * - Handles mouse/touch interactions
 * - Smooth 60fps rendering
 */
export const Canvas = React.forwardRef(({
  bodies,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  width = 800,
  height = 600,
}, ref) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const dragRef = useRef(null);

  // Setup canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    contextRef.current = context;

    // Combine refs
    if (ref) {
      if (typeof ref === 'function') {
        ref(canvas);
      } else {
        ref.current = canvas;
      }
    }
  }, [width, height, ref]);

  // Draw grid background
  const drawGrid = useCallback((context) => {
    context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    context.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  }, [width, height]);

  // Draw body
  const drawBody = useCallback((context, body) => {
    context.save();

    context.translate(body.position.x, body.position.y);
    context.rotate(body.angle);

    if (body.label === 'object') {
      // Glowing effect
      context.shadowColor = 'rgba(100, 200, 255, 0.8)';
      context.shadowBlur = 20;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;

      if (body.circleRadius) {
        // Draw circle
        context.fillStyle = `rgba(100, 200, 255, 0.8)`;
        context.beginPath();
        context.arc(0, 0, body.circleRadius, 0, Math.PI * 2);
        context.fill();

        // Draw outline
        context.strokeStyle = 'rgba(150, 220, 255, 1)';
        context.lineWidth = 2;
        context.stroke();
      } else if (body.vertices) {
        // Draw rectangle
        context.fillStyle = 'rgba(100, 200, 255, 0.8)';
        context.beginPath();

        const { x: vx, y: vy } = body.vertices[0];
        context.moveTo(vx - body.position.x, vy - body.position.y);

        for (let i = 1; i < body.vertices.length; i++) {
          const v = body.vertices[i];
          context.lineTo(v.x - body.position.x, v.y - body.position.y);
        }

        context.closePath();
        context.fill();

        context.strokeStyle = 'rgba(150, 220, 255, 1)';
        context.lineWidth = 2;
        context.stroke();
      }
    }

    context.restore();
  }, []);

  // Render loop
  useEffect(() => {
    if (!contextRef.current) return;

    const renderFrame = () => {
      const context = contextRef.current;

      // Clear canvas
      context.fillStyle = COLORS.GRAY_DARKER || '#0a0e27';
      context.fillRect(0, 0, width, height);

      // Draw grid
      drawGrid(context);

      // Draw boundaries
      context.strokeStyle = 'rgba(100, 200, 255, 0.5)';
      context.lineWidth = 3;
      context.strokeRect(0, 0, width, height);

      // Draw all bodies
      bodies.forEach((body) => {
        drawBody(context, body);
      });
    };

    renderFrame();
  }, [bodies, drawGrid, drawBody, width, height]);

  // Mouse/touch event handlers
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    dragRef.current = { x, y };
    onMouseDown?.(x, y);
  }, [onMouseDown]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onMouseMove?.(x, y);
  }, [onMouseMove]);

  const handleMouseUp = useCallback((e) => {
    dragRef.current = null;
    onMouseUp?.();
  }, [onMouseUp]);

  const handleTouchStart = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    dragRef.current = { x, y };
    onMouseDown?.(x, y);
  }, [onMouseDown]);

  const handleTouchMove = useCallback((e) => {
    if (!e.touches[0]) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    onMouseMove?.(x, y);
  }, [onMouseMove]);

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null;
    onMouseUp?.();
  }, [onMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        cursor: 'pointer',
        border: `2px solid rgba(100, 200, 255, 0.3)`,
        borderRadius: '8px',
        display: 'block',
        backgroundColor: COLORS.GRAY_DARKER || '#0a0e27',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
});

Canvas.displayName = 'Canvas';
