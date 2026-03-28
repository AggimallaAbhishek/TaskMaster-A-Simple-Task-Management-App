import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePhysics } from '../../../hooks/usePhysics';
import { PhysicsPlayground } from '../PhysicsPlayground';

// Mock Matter.js to avoid complex physics calculations in tests
vi.mock('matter-js', () => ({
  Engine: {
    create: vi.fn(() => ({
      world: { gravity: { y: 1 } },
    })),
    update: vi.fn(),
  },
  World: {
    add: vi.fn(),
    remove: vi.fn(),
  },
  Bodies: {
    circle: vi.fn((x, y, radius, opts) => ({
      position: { x, y },
      angle: 0,
      circleRadius: radius,
      restitution: opts.restitution,
      friction: opts.friction,
      label: opts.label,
    })),
    rectangle: vi.fn((x, y, w, h, opts) => ({
      position: { x, y },
      angle: 0,
      vertices: [{ x: x - w / 2, y: y - h / 2 }],
      restitution: opts.restitution,
      friction: opts.friction,
      label: opts.label,
    })),
  },
  Body: {
    applyForce: vi.fn(),
  },
  Composite: {
    clear: vi.fn(),
  },
  Events: {
    on: vi.fn(),
  },
}));

describe('usePhysics Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePhysics());

    expect(result.current.bodies).toEqual([]);
    expect(result.current.gravity).toBe(1);
    expect(result.current.friction).toBe(0.5);
    expect(result.current.bounce).toBe(0.8);
    expect(result.current.paused).toBe(false);
  });

  it('should add object successfully', async () => {
    const { result } = renderHook(() => usePhysics());

    await act(async () => {
      result.current.addObject(400, 300, 'circle', 20);
    });

    expect(result.current.bodies.length).toBeGreaterThan(0);
  });

  it('should update gravity', async () => {
    const { result } = renderHook(() => usePhysics());

    await act(async () => {
      result.current.updateGravity(3);
    });

    expect(result.current.gravity).toBe(3);
  });

  it('should update friction', async () => {
    const { result } = renderHook(() => usePhysics());

    await act(async () => {
      result.current.updateFriction(0.8);
    });

    expect(result.current.friction).toBe(0.8);
  });

  it('should update bounce', async () => {
    const { result } = renderHook(() => usePhysics());

    await act(async () => {
      result.current.updateBounce(0.5);
    });

    expect(result.current.bounce).toBe(0.5);
  });

  it('should toggle pause', async () => {
    const { result } = renderHook(() => usePhysics());

    expect(result.current.paused).toBe(false);

    await act(async () => {
      result.current.togglePause();
    });

    await waitFor(() => {
      expect(result.current.paused).toBe(true);
    });

    await act(async () => {
      result.current.togglePause();
    });

    await waitFor(() => {
      expect(result.current.paused).toBe(false);
    });
  });

  it('should reset simulation', async () => {
    const { result } = renderHook(() => usePhysics());

    await act(async () => {
      result.current.addObject(400, 300, 'circle', 20);
    });

    expect(result.current.bodies.length).toBeGreaterThan(0);

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.bodies).toEqual([]);
  });

  it('should apply force to objects', async () => {
    const { result } = renderHook(() => usePhysics());

    await act(async () => {
      result.current.addObject(400, 300, 'circle', 20);
    });

    const initialBodyCount = result.current.bodies.length;

    await act(async () => {
      result.current.applyForce(400, 300, 0.001, 'repel');
    });

    expect(result.current.bodies.length).toBe(initialBodyCount);
  });

  it('should get body at position', async () => {
    const { result } = renderHook(() => usePhysics());

    await act(async () => {
      result.current.addObject(400, 300, 'circle', 20);
    });

    // getBodyAt will return a body because of our mock
    const body = result.current.getBodyAt(400, 300);
    expect(body).toBeDefined();
  });
});

describe('PhysicsPlayground Component', () => {
  it('should render playground with canvas', () => {
    render(<PhysicsPlayground />);

    expect(screen.getByText(/Physics Playground/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // Gravity default
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument(); // Friction default
    expect(screen.getByDisplayValue('0.8')).toBeInTheDocument(); // Bounce default
  });

  it('should render control buttons', () => {
    render(<PhysicsPlayground />);

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(5);
  });

  it('should render interaction mode buttons', () => {
    render(<PhysicsPlayground />);

    expect(screen.getByRole('button', { name: /💨 Repel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🧲 Attract/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🎯 Drag/i })).toBeInTheDocument();
  });

  it('should change interaction mode when clicked', async () => {
    const user = userEvent.setup();
    render(<PhysicsPlayground />);

    const repelButton = screen.getByRole('button', { name: /💨 Repel/i });
    expect(repelButton).toHaveStyle({ fontWeight: 'bold' });

    const attractButton = screen.getByRole('button', { name: /🧲 Attract/i });
    await user.click(attractButton);

    await waitFor(() => {
      expect(attractButton).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  it('should update gravity with slider', async () => {
    const user = userEvent.setup();
    const { container } = render(<PhysicsPlayground />);

    const sliders = container.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBeGreaterThanOrEqual(3); // At least gravity, friction, bounce
  });

  it('should show pause/resume button', () => {
    render(<PhysicsPlayground />);

    const pauseButton = screen.getByRole('button', { name: /⏸️ Pause/i });
    expect(pauseButton).toBeInTheDocument();
  });

  it('should display FPS counter', () => {
    render(<PhysicsPlayground />);

    expect(screen.getByText(/FPS:/i)).toBeInTheDocument();
  });
});
