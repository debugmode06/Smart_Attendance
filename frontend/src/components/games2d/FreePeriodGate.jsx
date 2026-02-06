import { Sparkles, Loader2 } from "lucide-react";

export default function FreePeriodGate({ isFreePeriod, freeLoading }) {
  if (freeLoading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-3 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Checking free periods…</span>
      </div>
    );
  }

  if (!isFreePeriod) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center border border-dashed">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Mini Games Locked
        </h2>
        <p className="text-sm text-gray-600">
          Games unlock automatically during free periods.
        </p>
      </div>
    );
  }

  return null;
}

