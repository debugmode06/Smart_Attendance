import { Sparkles } from "lucide-react";

export default function StoryStep({ step, onNext }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">
            Story Scenario
          </p>
          <h4 className="text-sm font-bold text-gray-900">
            {step.title || "Imagine this situation"}
          </h4>
        </div>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {step.text ||
          "Read this short story and imagine yourself in this situation."}
      </p>

      <button
        onClick={onNext}
        className="mt-2 inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600"
      >
        I understood this story → Next
      </button>
    </div>
  );
}

