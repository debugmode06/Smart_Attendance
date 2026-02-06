import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import QuizModal from "../components/QuizModal";

export default function StudyMaterial() {
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://smart-face-attendance-mfkt.onrender.com/api/student/personal-material",
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const data = await res.json();

      setMaterial(data.material || "");
      setQuiz(data.quiz || []);
    } catch (err) {
      console.error("Study material load error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Personalized Study Material</h2>
              <p className="text-slate-300 text-sm mt-1">Auto-generated based on your personal interests</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-6 sm:p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
              <div className="h-4 w-3/5 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-6 sm:p-8 space-y-5">
          {material ? (
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
              {material}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">
              No material generated. Try again later.
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowQuiz(true)}
              disabled={!quiz || quiz.length === 0}
              className={`px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${
                quiz && quiz.length > 0
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Take Quiz
            </button>

            <button
              onClick={loadMaterial}
              className="px-6 py-3 rounded-xl font-bold border-2 border-slate-300 text-gray-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-md hover:shadow-lg"
            >
              Regenerate Material
            </button>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuiz && (
        <QuizModal
          quiz={quiz}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
}


