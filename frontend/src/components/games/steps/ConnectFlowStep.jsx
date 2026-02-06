import { useState, useEffect } from "react";
import { GitBranch, CheckCircle2, XCircle } from "lucide-react";

export default function ConnectFlowStep({ step, onNext }) {
  const [clicked, setClicked] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setClicked([]);
    setStatus(null);
  }, [step]);

  const nodes = Array.isArray(step.nodes) ? step.nodes : [];
  if (!nodes.length) {
    return <p className="text-sm text-gray-500">No nodes to connect.</p>;
  }

  const originalNodes = step.nodes || [];
  const correctPath =
    Array.isArray(step.correctPath) &&
    step.correctPath.length === originalNodes.length
      ? step.correctPath
      : originalNodes.map((_, idx) => idx);

  const expected = correctPath.map((idx) => originalNodes[idx]);

  const handleClick = (node) => {
    setStatus(null);
    setClicked((prev) => {
      if (prev.includes(node)) return prev; // ignore duplicate clicks
      const next = [...prev, node];

      if (next.length === expected.length) {
        const isCorrect =
          expected.length === next.length &&
          expected.every((val, idx) => val === next[idx]);

        if (isCorrect) {
          setStatus("correct");
          onNext();
        } else {
          setStatus("wrong");
        }
      }

      return next;
    });
  };

  const reset = () => {
    setClicked([]);
    setStatus(null);
  };

  const isSelected = (node) => clicked.includes(node);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wide">
            Connect the flow
          </p>
          <h4 className="text-sm font-bold text-gray-900">
            {step.title || "Tap components in correct order"}
          </h4>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Tap each node in sequence to show the correct flow. Example: client → API → server → database.
      </p>

      <div className="flex flex-wrap gap-2">
        {nodes.map((node, idx) => (
          <button
            key={`${node}-${idx}`}
            onClick={() => handleClick(node)}
            className={`px-3 py-2 rounded-full text-xs font-semibold border transition ${
              isSelected(node)
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-800 border-gray-300 hover:bg-purple-50"
            }`}
          >
            {node}
            {isSelected(node) && (
              <span className="ml-1 text-[10px] bg-white/20 px-1 rounded">
                {clicked.indexOf(node) + 1}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={reset}
        className="inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
      >
        Reset selection
      </button>

      {status === "correct" && (
        <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Flow connected correctly!</span>
        </div>
      )}

      {status === "wrong" && (
        <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
          <XCircle className="w-4 h-4" />
          <span>Something is out of order. Imagine how data travels in real life.</span>
        </div>
      )}

      {step.explanation && status === "correct" && (
        <p className="mt-2 text-xs text-gray-600 bg-purple-50 border border-purple-100 rounded-xl p-2">
          {step.explanation}
        </p>
      )}
    </div>
  );
}

