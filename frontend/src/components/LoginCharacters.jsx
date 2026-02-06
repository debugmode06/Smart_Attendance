import { useEffect, useRef, useState } from "react";

function Eye({ lookX, lookY, blink }) {
  return (
    <div
      className="w-5 h-5 bg-white rounded-full flex items-center justify-center transition-all duration-150"
      style={{ height: blink ? "2px" : "20px" }}
    >
      {!blink && (
        <div
          className="w-2.5 h-2.5 bg-black rounded-full"
          style={{
            transform: `translate(${lookX}px, ${lookY}px)`,
          }}
        />
      )}
    </div>
  );
}

export default function LoginCharacters({ mode }) {
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const ref = useRef(null);

  // Mouse tracking
  useEffect(() => {
    const move = (e) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);

      setLook({
        x: Math.max(-4, Math.min(4, dx / 60)),
        y: Math.max(-4, Math.min(4, dy / 60)),
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Blinking
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(t);
  }, []);

  // Typing reactions
  const eyeBehavior =
    mode === "password"
      ? { x: -4, y: -3 } // look away 👀
      : mode === "email"
      ? { x: 2, y: 2 } // curious
      : look;

  return (
    <div ref={ref} className="flex gap-6">
      {/* Character 1 */}
      <div className="w-20 h-44 bg-indigo-500 rounded-xl flex items-start justify-center pt-6">
        <div className="flex gap-2">
          <Eye lookX={eyeBehavior.x} lookY={eyeBehavior.y} blink={blink} />
          <Eye lookX={eyeBehavior.x} lookY={eyeBehavior.y} blink={blink} />
        </div>
      </div>

      {/* Character 2 */}
      <div className="w-16 h-32 bg-gray-900 rounded-lg flex items-start justify-center pt-5">
        <div className="flex gap-2">
          <Eye lookX={eyeBehavior.x} lookY={eyeBehavior.y} blink={blink} />
          <Eye lookX={eyeBehavior.x} lookY={eyeBehavior.y} blink={blink} />
        </div>
      </div>

      {/* Character 3 */}
      <div className="w-24 h-28 bg-yellow-400 rounded-full flex items-center justify-center">
        <div className="flex gap-3">
          <div
            className="w-3 h-3 bg-black rounded-full"
            style={{
              transform: `translate(${eyeBehavior.x}px, ${eyeBehavior.y}px)`,
            }}
          />
          <div
            className="w-3 h-3 bg-black rounded-full"
            style={{
              transform: `translate(${eyeBehavior.x}px, ${eyeBehavior.y}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

