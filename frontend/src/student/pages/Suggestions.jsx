import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Sparkles } from "lucide-react";

/* ------------------------------------------
   RECOMMENDATION DATA
------------------------------------------ */
const recommendationsData = {
  "Web Development": [
    {
      role: "Frontend Developer",
      difficulty: 45,
      description: "Build beautiful UI using HTML, CSS, JavaScript & React.",
      tasks: ["Build a portfolio website", "Clone Instagram UI"],
      resources: ["MDN Docs", "React Docs", "Frontend Mentor"],
    },
    {
      role: "Fullstack Developer",
      difficulty: 70,
      description: "Work with frontend + backend + APIs + Database.",
      tasks: ["Build a MERN CRUD app", "Implement user auth"],
      resources: ["Node.js Docs", "MongoDB University"],
    },
  ],
  "Data Science": [
    {
      role: "Data Analyst",
      difficulty: 55,
      description: "Analyze structured data & generate insights.",
      tasks: ["Work with Pandas", "Build dashboards"],
      resources: ["Kaggle", "Tableau Tutorials"],
    },
    {
      role: "Data Scientist",
      difficulty: 85,
      description: "Train ML models & create predictions.",
      tasks: ["Build ML models", "Compete in Kaggle"],
      resources: ["Scikit Learn", "Coursera ML"],
    },
  ],
  "AI / ML": [
    {
      role: "Machine Learning Engineer",
      difficulty: 90,
      description: "Deep learning, neural networks & model deployment.",
      tasks: ["Train neural networks", "Deploy AI model"],
      resources: ["Tensorflow Docs", "PyTorch Docs"],
    },
  ],
  "Cybersecurity": [
    {
      role: "Security Analyst",
      difficulty: 75,
      description: "Protect systems & detect vulnerabilities.",
      tasks: ["TryHackMe Labs", "CTF Challenges"],
      resources: ["OWASP", "HackTheBox"],
    },
  ],
};

/* ------------------------------------------
   COMPONENT
------------------------------------------ */
export default function StudentRecommendations() {
  const [interest, setInterest] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [savedInterests, setSavedInterests] = useState([]);
  const [openSavedRec, setOpenSavedRec] = useState(null);
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  /* Load saved interests */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedInterests")) || [];
    setSavedInterests(saved);
  }, []);

  /* Save to localStorage */
  const saveInterest = (rec) => {
    const updated = [...savedInterests, rec];
    setSavedInterests(updated);
    localStorage.setItem("savedInterests", JSON.stringify(updated));
  };

  const handleRecommend = () => {
    setRecommendations(recommendationsData[interest] || []);
  };

  /* Difficulty color */
  const difficultyColor = (value) => {
    if (value < 50) return "bg-green-500";
    if (value < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  /* When clicking marked interest badge */
  const openSavedInterest = (rec) => {
    setOpenSavedRec(rec);
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
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
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Career & Domain Recommendations</h2>
              <p className="text-slate-300 text-sm mt-1">Discover your path based on your interests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-300">
      <div className="flex gap-3 items-center flex-col sm:flex-row">
        <select
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
            className="p-3.5 border-2 border-blue-200 rounded-xl w-full sm:w-64 bg-gradient-to-br from-blue-50 to-indigo-50 font-semibold text-gray-700 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="">Select your interest</option>
          {Object.keys(recommendationsData).map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        <button
          onClick={handleRecommend}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        >
          Show Recommendations
        </button>
        </div>
      </div>

      {/* SAVED INTERESTS */}
      {savedInterests.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-3xl shadow-xl border-2 border-yellow-200">
          <h3 className="font-extrabold text-xl text-amber-800 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            Your Marked Interests
          </h3>

          <div className="flex gap-3 flex-wrap">
            {savedInterests.map((s, idx) => (
              <button
                key={idx}
                onClick={() => openSavedInterest(s)}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                ⭐ {s.role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------
          SHOW SAVED INTEREST CARD
      ------------------------- */}
      {openSavedRec && (
        <div ref={scrollRef}>
          <h3 className="text-2xl font-bold text-purple-700 mb-2">
            ⭐ Your Saved Interest
          </h3>
          <RecommendationCard
            rec={openSavedRec}
            onSave={saveInterest}
            difficultyColor={difficultyColor}
            navigate={navigate}
          />
        </div>
      )}

      {/* MAIN RESULTS */}
      <div className="space-y-6">
        {recommendations.map((rec, idx) => (
          <RecommendationCard
            key={idx}
            rec={rec}
            onSave={saveInterest}
            difficultyColor={difficultyColor}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------
   COMPONENT FOR CARD (REUSED)
------------------------------------------ */
function RecommendationCard({ rec, onSave, difficultyColor, navigate }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-slate-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">

      {/* TITLE + STAR */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-purple-600" /> {rec.role}
        </h3>

        <button
          onClick={() => onSave(rec)}
          className="text-yellow-500 hover:text-yellow-600 transition"
        >
          <Star className="w-8 h-8" fill="gold" />
        </button>
      </div>

      <p className="text-gray-600 mt-2">{rec.description}</p>

      {/* DIFFICULTY */}
      <div className="mt-4">
        <p className="font-semibold text-gray-700">
          Difficulty Level: {rec.difficulty}%
        </p>

        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mt-1">
          <div
            className={`h-4 ${difficultyColor(rec.difficulty)} transition-all`}
            style={{ width: `${rec.difficulty}%` }}
          ></div>
        </div>
      </div>

      {/* TASKS */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700">Suggested Tasks:</h4>
        <ul className="list-disc list-inside text-gray-600">
          {rec.tasks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      {/* RESOURCES */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700">Resources:</h4>
        <ul className="list-disc list-inside text-gray-600">
          {rec.resources.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* AI MENTOR BUTTON */}
      <button
        onClick={() => navigate("/student/ai")}
        className="mt-5 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
      >
        <Sparkles className="w-5 h-5" /> Ask AI Mentor
      </button>
    </div>
  );
}

