import { BookOpen } from "lucide-react";

export default function LearnCardStep({ step, onDone }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
            Concept Card
          </p>
          <h4 className="text-sm font-bold text-gray-900">
            {step.title || "Understand this concept"}
          </h4>
        </div>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {step.text ||
          step.content ||
          "Here is a simple explanation. Read it slowly and connect it to a real example in your life."}
      </p>

      <button
        onClick={onDone}
        className="mt-2 inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
      >
        Got it, next step →
      </button>
    </div>
  );
}

