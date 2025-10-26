import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Ripple = {
  id: number;
  x: number;
  y: number;
  createdAt: number;
};

// Rainbow Cursor Splash (Framer-like): colorful ripples trail the cursor
// Notes: This is a high-fidelity replica suitable for React apps using framer-motion.
export default function CursorSplash() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [visible, setVisible] = useState(true);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const xs = useSpring(x, { damping: 30, stiffness: 700, mass: 0.4 });
  const ys = useSpring(y, { damping: 30, stiffness: 700, mass: 0.4 });

  const gradient = useMemo(
    () =>
      "conic-gradient(from 0deg, #ff3b3b, #ff9a3b, #ffd93b, #6ee75b, #3bb4ff, #6b6bff, #ff3bde, #ff3b3b)",
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX - 14);
      y.set(e.clientY - 14);

      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY, createdAt: Date.now() }]);
      // cleanup after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 800);
    };
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  return (
    <>
      {/* Cursor core (subtle) */}
      <motion.div
        className="pointer-events-none fixed z-50 h-7 w-7 rounded-full mix-blend-difference"
        style={{ left: xs, top: ys, background: gradient, filter: "blur(4px)" }}
        animate={{ opacity: visible ? 0.9 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Rainbow ripples */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="pointer-events-none fixed z-40 rounded-full"
            style={{
              left: r.x - 12,
              top: r.y - 12,
              width: 24,
              height: 24,
              background: gradient,
              filter: "blur(8px)",
              mixBlendMode: "screen",
            }}
            initial={{ scale: 0.2, opacity: 0.9, rotate: 0 }}
            animate={{ scale: 3, opacity: 0, rotate: 120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
