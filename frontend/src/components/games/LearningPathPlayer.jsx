import { useState, useEffect } from "react";

export default function LearningPathPlayer({ path, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [mcqSelected, setMcqSelected] = useState(null);
  const [mcqResult, setMcqResult] = useState(null);
  const [orderState, setOrderState] = useState([]);
  const [orderResult, setOrderResult] = useState(null);
  const [loadingIntro, setLoadingIntro] = useState(true); // 🔥 10s AI “generation”

  if (!path || !path.steps || !path.steps.length) {
    return (
      <div className="bg-yellow-50 p-4 rounded-xl border text-yellow-700">
        No learning path available.
      </div>
    );
  }

  const steps = path.steps;
  const current = steps[stepIndex];

  const getText = (step) =>
    step.text ||
    step.prompt ||
    step.content ||
    step.description ||
    "No content provided.";

  // Intro “AI is generating your mission…” delay
  useEffect(() => {
    setLoadingIntro(true);
    const t = setTimeout(() => setLoadingIntro(false), 18000); // 18 seconds
    return () => clearTimeout(t);
  }, [path.gameId]);

  // Reset per-step state
  useEffect(() => {
    setMcqSelected(null);
    setMcqResult(null);
    setOrderResult(null);

    const step = steps[stepIndex];
    if (step && step.type === "drag_order" && Array.isArray(step.items)) {
      const initial = step.items.map((text, idx) => ({ index: idx, text }));
      setOrderState(initial);
    } else {
      setOrderState([]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex, steps]);

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete && onComplete();
    }
  };

  const heroLine = (() => {
    switch (current.type) {
      case "story":
        return "Story time! Visualize this like a comic scene in your head.";
      case "learn_card":
        return "Let me break this concept into simple, friendly language.";
      case "mcq":
        return "Choose the answer that feels right. I’ll show you how you did!";
      case "drag_order":
        return "Reorder the steps into the correct logical sequence.";
      case "connect_flow":
        return "Follow the flow and imagine the system working step by step.";
      case "code_blocks":
        return "Read the code blocks and imagine how the program executes.";
      default:
        return "Keep going, one step at a time. You’re doing great!";
    }
  })();

  // MCQ logic
  const handleMcqClick = (idx) => {
    setMcqSelected(idx);
    if (typeof current.correctIndex === "number") {
      setMcqResult(idx === current.correctIndex ? "correct" : "wrong");
    } else {
      setMcqResult(null);
    }
  };

  // Order logic
  const moveOrderItem = (from, to) => {
    setOrderState((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setOrderResult(null);
  };

  const checkOrder = () => {
    const step = steps[stepIndex];
    if (!step || !Array.isArray(step.correctOrder)) return;
    const correctOrder = step.correctOrder;
    const userOrder = orderState.map((it) => it.index);
    const ok =
      userOrder.length === correctOrder.length &&
      correctOrder.every((v, i) => v === userOrder[i]);

    setOrderResult(ok ? "correct" : "wrong");
  };

  // ----- INTRO LOADING SCREEN -----
  if (loadingIntro) {
    return (
      <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 rounded-2xl shadow-lg">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white text-3xl">
            🦸
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide">
              AI Mentor Hero
            </p>
            <p className="text-sm text-white">
              Sit tight, I’m generating a personalised 10-step mission based on your interests…
            </p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-blue-100 shadow-inner space-y-3">
          <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
            <div className="h-2 bg-blue-600 animate-[progressBar_10s_linear_forwards]" />
          </div>

          <p className="text-xs text-gray-600">
            Analysing your interest, difficulty and recent activity…
          </p>

          <div className="flex gap-2 text-[11px] text-gray-500 flex-wrap">
            <span className="px-2 py-1 rounded-full bg-gray-100">
              🧠 Mapping concepts
            </span>
            <span className="px-2 py-1 rounded-full bg-gray-100">
              🎮 Designing tasks
            </span>
            <span className="px-2 py-1 rounded-full bg-gray-100">
              📝 Crafting stories
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* HERO PANEL */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-100 via-blue-100 to-cyan-100 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl shadow-md">
          🦸
        </div>
        <div>
          <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">
            AI Learning Hero
          </p>
          <p className="text-sm text-gray-800">{heroLine}</p>
        </div>
      </div>

      {/* HEADER + STEP CHIP ROW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{path.title}</h1>
          <p className="text-sm text-gray-500">{path.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500">
            Step {stepIndex + 1} / {steps.length}
          </span>
          <div className="flex gap-1 max-w-[220px] overflow-x-auto">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === stepIndex
                    ? "bg-blue-600 scale-110"
                    : "bg-gray-300"
                } transition`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* STEP CARD */}
      <div className="bg-white p-5 rounded-2xl border shadow space-y-4 transform transition-all duration-300">

        {/* STORY */}
        {current.type === "story" && (
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-1">
              Story
            </div>
            <h4 className="font-bold text-lg text-gray-900">{current.title}</h4>
            <p className="text-gray-700 mt-2 leading-relaxed">
              {getText(current)}
            </p>
          </div>
        )}

        {/* LEARN CARD */}
        {current.type === "learn_card" && (
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-1">
              Concept
            </div>
            <h4 className="font-bold text-lg text-gray-900">{current.title}</h4>
            <p className="text-gray-700 mt-2 leading-relaxed">
              {getText(current)}
            </p>
          </div>
        )}

        {/* MCQ */}
        {current.type === "mcq" && (
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
              Quick Check
            </div>
            <h4 className="font-bold text-lg text-gray-900">{current.title}</h4>
            <p className="text-gray-700 mt-2">{getText(current)}</p>

            <div className="mt-3 space-y-2">
              {current.options?.map((opt, idx) => {
                const isSelected = mcqSelected === idx;
                const isCorrect =
                  isSelected && mcqResult === "correct" && current.correctIndex === idx;
                const isWrong =
                  isSelected && mcqResult === "wrong" && current.correctIndex !== idx;

                let classes =
                  "w-full text-left p-3 rounded-xl border text-sm transition transform hover:scale-[1.02] cursor-pointer";

                if (isCorrect) {
                  classes += " bg-green-100 border-green-500";
                } else if (isWrong) {
                  classes += " bg-red-100 border-red-500";
                } else if (isSelected) {
                  classes += " bg-purple-50 border-purple-400";
                } else {
                  classes += " bg-gray-50 border-gray-200 hover:bg-white";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleMcqClick(idx)}
                    className={classes}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {mcqResult === "correct" && (
              <p className="text-sm text-green-600 mt-1 animate-[fadeIn_0.2s_ease-out]">
                ✅ Nice! That’s the best choice.
              </p>
            )}
            {mcqResult === "wrong" && (
              <p className="text-sm text-red-500 mt-1 animate-[fadeIn_0.2s_ease-out]">
                ❌ Not quite. Try a different option or think again.
              </p>
            )}
          </div>
        )}

        {/* DRAG ORDER (UP/DOWN buttons) */}
        {current.type === "drag_order" && (
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              Arrange Steps
            </div>
            <h4 className="font-bold text-lg text-gray-900">{current.title}</h4>
            {getText(current) && (
              <p className="text-gray-700 mt-1">{getText(current)}</p>
            )}

            <div className="mt-3 space-y-2">
              {orderState.map((item, idx) => (
                <div
                  key={item.index}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm shadow-sm"
                >
                  <span className="text-gray-400 w-5 text-center">
                    {idx + 1}.
                  </span>
                  <span className="flex-1">{item.text}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveOrderItem(idx, idx - 1)}
                      className="px-2 py-1 rounded-lg border text-xs hover:bg-gray-100"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveOrderItem(idx, idx + 1)}
                      className="px-2 py-1 rounded-lg border text-xs hover:bg-gray-100"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={checkOrder}
              className="mt-2 inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition"
            >
              Check Order ✅
            </button>

            {orderResult === "correct" && (
              <p className="text-sm text-green-600 mt-1 animate-[fadeIn_0.2s_ease-out]">
                Perfect! The sequence is correct.
              </p>
            )}
            {orderResult === "wrong" && (
              <p className="text-sm text-red-500 mt-1 animate-[fadeIn_0.2s_ease-out]">
                Not fully correct yet. Try reordering the steps again!
              </p>
            )}
          </div>
        )}

        {/* CONNECT FLOW */}
        {current.type === "connect_flow" && (
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
              Process Flow
            </div>
            <h4 className="font-bold text-lg text-gray-900">{current.title}</h4>
            <p className="text-gray-700 mt-1">{getText(current)}</p>

            <div className="mt-3 space-y-2">
              {current.nodes?.map((node, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow">
                    {idx + 1}
                  </div>
                  <span className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                    {node}
                  </span>
                  {idx < current.nodes.length - 1 && (
                    <span className="text-indigo-400 text-lg">➜</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CODE BLOCKS */}
        {current.type === "code_blocks" && (
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              Code Blocks
            </div>
            <h4 className="font-bold text-lg text-gray-900">{current.title}</h4>
            <p className="text-gray-700 mt-1">{getText(current)}</p>

            <div className="mt-3 space-y-2">
              {current.blocks?.map((line, idx) => (
                <pre
                  key={idx}
                  className="bg-black text-green-300 p-3 rounded-xl text-xs overflow-x-auto font-mono"
                >
                  {line}
                </pre>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NEXT BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={next}
          className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-[1px] transition"
        >
          {stepIndex < steps.length - 1 ? "Next →" : "Finish Mission 🎉"}
        </button>
      </div>
    </div>
  );
}

