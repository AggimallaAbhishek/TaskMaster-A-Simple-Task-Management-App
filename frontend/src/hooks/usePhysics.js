import { useCallback, useEffect, useRef, useState } from 'react';
import { Engine, World, Events, Bodies, Body, Composite } from 'matter-js';

/**
 * usePhysics - Custom hook for Matter.js physics simulation
 *
 * Manages:
 * - Physics engine and world
 * - Bodies (objects) creation and removal
 * - Force application (cursor/click interactions)
 * - Parameter controls (gravity, friction, bounce)
 * - 60fps animation loop
 */
export const usePhysics = () => {
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const bodiesRef = useRef([]);
  const frameRef = useRef(0);
  const rafRef = useRef(null);

  const [bodies, setBodies] = useState([]);
  const [gravity, setGravity] = useState(1);
  const [friction, setFriction] = useState(0.5);
  const [bounce, setBounce] = useState(0.8);
  const [paused, setPaused] = useState(false);
  const [fps, setFps] = useState(0);

  // Initialize physics engine
  const initEngine = useCallback(() => {
    const engine = Engine.create();
    const world = engine.world;

    // Set initial gravity
    world.gravity.y = gravity;

    engineRef.current = engine;
    worldRef.current = world;
    bodiesRef.current = [];

    return engine;
  }, [gravity]);

  // Add object (sphere or box)
  const addObject = useCallback((x, y, type = 'circle', size = 20) => {
    if (!worldRef.current || !engineRef.current) return;

    let body;
    if (type === 'circle') {
      body = Bodies.circle(x, y, size, {
        restitution: bounce,
        friction: friction,
        label: 'object',
      });
    } else {
      body = Bodies.rectangle(x, y, size * 1.5, size, {
        restitution: bounce,
        friction: friction,
        label: 'object',
      });
    }

    World.add(worldRef.current, body);
    bodiesRef.current.push(body);

    setBodies([...bodiesRef.current]);
  }, [bounce, friction]);

  // Apply force from cursor (repulsion/attraction)
  const applyForce = useCallback((x, y, forceMagnitude = 0.001, forceType = 'repel') => {
    if (!bodiesRef.current) return;

    bodiesRef.current.forEach((body) => {
      // Calculate distance from cursor
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only apply force if within interaction radius
      if (distance < 150 && distance > 0) {
        const angle = Math.atan2(dy, dx);
        const force = { x: 0, y: 0 };

        if (forceType === 'repel') {
          force.x = Math.cos(angle) * forceMagnitude;
          force.y = Math.sin(angle) * forceMagnitude;
        } else if (forceType === 'attract') {
          force.x = -Math.cos(angle) * forceMagnitude;
          force.y = -Math.sin(angle) * forceMagnitude;
        }

        Body.applyForce(body, body.position, force);
      }
    });
  }, []);

  // Drag body with spring constraint
  const dragBody = useCallback((x, y, targetBody) => {
    if (!targetBody) return;

    const strength = 0.001;
    const dx = x - targetBody.position.x;
    const dy = y - targetBody.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const force = {
        x: (dx / distance) * strength * distance,
        y: (dy / distance) * strength * distance,
      };
      Body.applyForce(targetBody, targetBody.position, force);
    }
  }, []);

  // Find body at position (for dragging)
  const getBodyAt = useCallback((x, y) => {
    if (!bodiesRef.current) return null;

    for (let i = bodiesRef.current.length - 1; i >= 0; i--) {
      const body = bodiesRef.current[i];
      const dx = x - body.position.x;
      const dy = y - body.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < body.circleRadius || (body.vertices && distance < 40)) {
        return body;
      }
    }
    return null;
  }, []);

  // Reset simulation
  const reset = useCallback(() => {
    if (!worldRef.current || !engineRef.current) return;

    // Remove all bodies
    Composite.clear(worldRef.current, false);
    bodiesRef.current = [];
    setBodies([]);
  }, []);

  // Update gravity
  const updateGravity = useCallback((value) => {
    setGravity(value);
    if (worldRef.current) {
      worldRef.current.gravity.y = value;
    }
  }, []);

  // Update friction on all bodies
  const updateFriction = useCallback((value) => {
    setFriction(value);
    if (bodiesRef.current) {
      bodiesRef.current.forEach((body) => {
        body.friction = value;
      });
    }
  }, []);

  // Update bounce on all bodies
  const updateBounce = useCallback((value) => {
    setBounce(value);
    if (bodiesRef.current) {
      bodiesRef.current.forEach((body) => {
        body.restitution = value;
      });
    }
  }, []);

  // Animation loop
  useEffect(() => {
    if (!engineRef.current) {
      initEngine();
    }

    let fpsCounter = 0;
    let lastFpsTime = performance.now();

    const animate = (currentTime) => {
      // Calculate FPS
      fpsCounter++;
      if (currentTime - lastFpsTime >= 1000) {
        setFps(fpsCounter);
        fpsCounter = 0;
        lastFpsTime = currentTime;
      }

      if (!paused && engineRef.current) {
        Engine.update(engineRef.current);
        setBodies([...bodiesRef.current]);

        // Remove bodies that fall off screen
        bodiesRef.current = bodiesRef.current.filter((body) => {
          if (body.position.y > 800) {
            World.remove(worldRef.current, body);
            return false;
          }
          return true;
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [paused, initEngine]);

  return {
    bodies,
    gravity,
    friction,
    bounce,
    paused,
    fps,
    addObject,
    applyForce,
    dragBody,
    getBodyAt,
    reset,
    updateGravity,
    updateFriction,
    updateBounce,
    togglePause: () => setPaused(!paused),
    initEngine,
  };
};
