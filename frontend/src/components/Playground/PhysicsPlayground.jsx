import React, { useCallback, useState, useRef } from 'react';
import { usePhysics } from '../../hooks/usePhysics';
import { Canvas } from './Canvas';
import { COLORS, COMMON_STYLES } from '../../styles/theme';

/**
 * PhysicsPlayground - Interactive physics simulation playground
 *
 * Features:
 * - Canvas with Matter.js physics
 * - Parameter controls (gravity, friction, bounce)
 * - Object creation buttons
 * - Pause/Resume and Reset buttons
 * - Instructions and FPS counter
 */
export function PhysicsPlayground() {
  const physics = usePhysics();
  const draggedBodyRef = useRef(null);
  const [interactionMode, setInteractionMode] = useState('repel'); // 'repel', 'attract', 'drag'

  // Add random object at random position
  const addRandomObject = useCallback(() => {
    const x = 100 + Math.random() * (800 - 200);
    const y = 50 + Math.random() * 150;
    const type = Math.random() > 0.5 ? 'circle' : 'box';
    const size = 15 + Math.random() * 15;
    physics.addObject(x, y, type, size);
  }, [physics]);

  // Handle canvas mouse events
  const handleMouseMove = useCallback((x, y) => {
    if (interactionMode === 'drag' && draggedBodyRef.current) {
      physics.dragBody(x, y, draggedBodyRef.current);
    } else if (interactionMode === 'repel' || interactionMode === 'attract') {
      physics.applyForce(x, y, 0.0008, interactionMode);
    }
  }, [physics, interactionMode]);

  const handleMouseDown = useCallback((x, y) => {
    if (interactionMode === 'drag') {
      draggedBodyRef.current = physics.getBodyAt(x, y);
    }
  }, [physics, interactionMode]);

  const handleMouseUp = useCallback(() => {
    draggedBodyRef.current = null;
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: COLORS.GRAY_LIGHT,
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ marginTop: 0, color: COLORS.TEXT_PRIMARY }}>🎮 Physics Playground</h2>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Canvas */}
        <div>
          <Canvas
            bodies={physics.bodies}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            width={800}
            height={600}
          />
          <div
            style={{
              marginTop: '10px',
              fontSize: '12px',
              color: COLORS.TEXT_MUTED,
              textAlign: 'center',
            }}
          >
            <strong>FPS:</strong> {physics.fps} | <strong>Objects:</strong> {physics.bodies.length}/100
          </div>
        </div>

        {/* Control Panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '15px',
            backgroundColor: COLORS.GRAY,
            borderRadius: '8px',
            minWidth: '250px',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: COLORS.TEXT_PRIMARY }}>Controls</h3>

          {/* Gravity Control */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: COLORS.TEXT_PRIMARY,
              }}
            >
              Gravity: {physics.gravity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={physics.gravity}
              onChange={(e) => physics.updateGravity(parseFloat(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
              }}
            />
            <small style={{ color: COLORS.TEXT_MUTED }}>0 = space, 5 = super heavy</small>
          </div>

          {/* Friction Control */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: COLORS.TEXT_PRIMARY,
              }}
            >
              Friction: {physics.friction.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={physics.friction}
              onChange={(e) => physics.updateFriction(parseFloat(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
              }}
            />
            <small style={{ color: COLORS.TEXT_MUTED }}>0 = ice, 1 = mud</small>
          </div>

          {/* Bounce Control */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: COLORS.TEXT_PRIMARY,
              }}
            >
              Bounce: {physics.bounce.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={physics.bounce}
              onChange={(e) => physics.updateBounce(parseFloat(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
              }}
            />
            <small style={{ color: COLORS.TEXT_MUTED }}>0 = dead, 1 = super bouncy</small>
          </div>

          {/* Spacer */}
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Interaction Mode */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: COLORS.TEXT_PRIMARY,
              }}
            >
              Cursor Mode:
            </label>
            {['repel', 'attract', 'drag'].map((mode) => (
              <button
                key={mode}
                onClick={() => setInteractionMode(mode)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  marginBottom: '5px',
                  backgroundColor:
                    interactionMode === mode ? COLORS.PRIMARY : COLORS.GRAY_DARKER,
                  color: COLORS.TEXT_WHITE,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: interactionMode === mode ? 'bold' : 'normal',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {mode === 'drag' ? '🎯 Drag' : mode === 'attract' ? '🧲 Attract' : '💨 Repel'}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Add Objects */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: COLORS.TEXT_PRIMARY,
              }}
            >
              Add Objects:
            </label>
            {['circle', 'box', 'random'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  if (type === 'random') {
                    addRandomObject();
                  } else {
                    const x = 400 + (Math.random() - 0.5) * 200;
                    const y = 100;
                    physics.addObject(x, y, type === 'circle' ? 'circle' : 'box');
                  }
                }}
                style={{
                  ...COMMON_STYLES.button,
                  width: '100%',
                  padding: '8px 12px',
                  marginBottom: '5px',
                  backgroundColor: COLORS.PRIMARY,
                  color: COLORS.TEXT_WHITE,
                  fontSize: '12px',
                  textTransform: 'capitalize',
                }}
              >
                {type === 'circle' ? '● Circle' : type === 'box' ? '■ Box' : '🎲 Random'}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Action Buttons */}
          <button
            onClick={() => physics.togglePause()}
            style={{
              ...COMMON_STYLES.button,
              width: '100%',
              padding: '10px',
              backgroundColor: physics.paused ? COLORS.WARNING : COLORS.SUCCESS,
              color: COLORS.TEXT_WHITE,
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {physics.paused ? '▶️ Resume' : '⏸️ Pause'}
          </button>

          <button
            onClick={() => physics.reset()}
            style={{
              ...COMMON_STYLES.button,
              width: '100%',
              padding: '10px',
              backgroundColor: COLORS.DANGER,
              color: COLORS.TEXT_WHITE,
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            🔄 Reset
          </button>

          {/* Info */}
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: 'rgba(100, 200, 255, 0.1)',
              borderRadius: '4px',
              fontSize: '11px',
              color: COLORS.TEXT_MUTED,
              lineHeight: '1.4',
            }}
          >
            <strong>💡 Tips:</strong>
            <br />• Click objects to interact
            <br />• Adjust sliders to change physics
            <br />• Switch cursor modes for different effects
            <br />• Max 100 objects
          </div>
        </div>
      </div>
    </div>
  );
}
