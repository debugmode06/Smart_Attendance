import { useState, useEffect } from "react";
import { HelpCircle, CheckCircle2, XCircle } from "lucide-react";

export default function McqStep({ step, onNext }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setSelected(null);
    setStatus(null);
  }, [step]);

  const options = Array.isArray(step.options) ? step.options : [];
  const correctIndex =
    typeof step.correctIndex === "number" &&
    step.correctIndex >= 0 &&
    step.correctIndex < options.length
      ? step.correctIndex
      : 0;

  if (!options.length) {
    return (
      <p className="text-sm text-gray-500">
        No options provided for this question.
      </p>
    );
  }

  const check = (idx) => {
    setSelected(idx);
    const isCorrect = idx === correctIndex;
    setStatus(isCorrect ? "correct" : "wrong");
    if (isCorrect) onNext();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
            Quick reflection
          </p>
          <h4 className="text-sm font-bold text-gray-900">
            {step.title || "Choose the best option"}
          </h4>
        </div>
      </div>

      <p className="text-sm text-gray-700">
        {step.prompt ||
          "Pick the option that best matches what you just learned."}
      </p>

      <div className="grid gap-2">
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrectChoice = status === "correct" && idx === correctIndex;
          const isWrongChoice = status === "wrong" && idx === selected;

          let classes =
            "px-3 py-2 rounded-xl border text-left text-sm transition";

          if (isCorrectChoice) {
            classes += " bg-emerald-100 text-emerald-800 border-emerald-400";
          } else if (isWrongChoice) {
            classes += " bg-red-50 text-red-700 border-red-300";
          } else if (isSelected) {
            classes += " bg-indigo-600 text-white border-indigo-600";
          } else {
            classes += " bg-white text-gray-800 border-gray-200 hover:bg-indigo-50";
          }

          return (
            <button
              key={`${opt}-${idx}`}
              onClick={() => check(idx)}
              className={classes}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {status === "correct" && (
        <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Nice! That captures the idea.</span>
        </div>
      )}

      {status === "wrong" && (
        <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
          <XCircle className="w-4 h-4" />
          <span>Not the best choice. Reconnect with the earlier story.</span>
        </div>
      )}

      {step.explanation && status === "correct" && (
        <p className="mt-2 text-xs text-gray-600 bg-indigo-50 border border-indigo-100 rounded-xl p-2">
          {step.explanation}
        </p>
      )}
    </div>
  );
}

