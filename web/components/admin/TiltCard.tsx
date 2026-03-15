"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

const springConfig = { stiffness: 300, damping: 30 };
const MAX_TILT = 15;
const DRAG_SENSITIVITY = 0.5;

export default function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const prevMouse = useRef<{ x: number; y: number } | null>(null);
  const dragRotation = useRef({ x: 0, y: 0 });

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);

  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);

  const mouseNormX = useMotionValue(50);
  const mouseNormY = useMotionValue(50);
  const shineX = useSpring(mouseNormX, springConfig);
  const shineY = useSpring(mouseNormY, springConfig);

  const shadowX = useTransform(rotateY, (v) => {
    const clamped = ((v % 360) + 360) % 360;
    const effective = clamped > 180 ? clamped - 360 : clamped;
    return effective * -2;
  });
  const shadowY = useTransform(rotateX, (v) => {
    const clamped = ((v % 360) + 360) % 360;
    const effective = clamped > 180 ? clamped - 360 : clamped;
    return effective * 2;
  });

  const boxShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) => `${sx}px ${sy}px 30px rgba(0,0,0,0.4)`
  );

  const shineBackground = useTransform(
    [shineX, shineY],
    ([px, py]) =>
      `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.12), transparent 60%)`
  );

  // Window-level mousemove/mouseup for drag (so card doesn't lose tracking when rotated)
  const handleWindowMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !prevMouse.current) return;
    const dx = e.clientX - prevMouse.current.x;
    const dy = e.clientY - prevMouse.current.y;
    dragRotation.current.y += dx * DRAG_SENSITIVITY;
    dragRotation.current.x -= dy * DRAG_SENSITIVITY;
    rawRotateY.set(dragRotation.current.y);
    rawRotateX.set(dragRotation.current.x);
    prevMouse.current = { x: e.clientX, y: e.clientY };
  }, [rawRotateX, rawRotateY]);

  const handleWindowMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    prevMouse.current = null;
    dragRotation.current = { x: 0, y: 0 };
    rawRotateX.set(0);
    rawRotateY.set(0);
    mouseNormX.set(50);
    mouseNormY.set(50);
  }, [rawRotateX, rawRotateY, mouseNormX, mouseNormY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [handleWindowMouseMove, handleWindowMouseUp]);

  // Hover: position-based tilt
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) return; // drag is handled at window level
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateY.set(normX * MAX_TILT * 2);
    rawRotateX.set(normY * -MAX_TILT * 2);
    mouseNormX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseNormY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragRotation.current.x = rawRotateX.get();
    dragRotation.current.y = rawRotateY.get();
    prevMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseLeave = () => {
    if (isDragging.current) return; // don't reset during drag
    prevMouse.current = null;
    rawRotateX.set(0);
    rawRotateY.set(0);
    mouseNormX.set(50);
    mouseNormY.set(50);
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow,
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        className="relative rounded-xl overflow-hidden"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: shineBackground }}
        />
      </motion.div>
    </div>
  );
}
