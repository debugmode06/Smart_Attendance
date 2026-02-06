import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LogicDrift({ onExit }) {
  const [scenarios, setScenarios] = useState([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(1); // 0 = FALSE, 1 = ?, 2 = TRUE
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | over
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadAI = async () => {
      try {
        const res = await axios.post("https://smart-face-attendance-mfkt.onrender.com/api/games/ai/logic-drift");
        if (mounted) {
          setScenarios(res.data);
        }
      } catch {
        // fallback (never blocks gameplay)
        if (mounted) {
          setScenarios([
            { text: "x = 5, condition x > 3", correct: "TRUE", hint: "Compare numbers" },
            { text: "flag = false, condition flag == true", correct: "FALSE", hint: "Boolean check" },
          ]);
        }
      } finally {
        if (mounted) setLoadingAI(false);
      }
    };
    loadAI();
    return () => (mounted = false);
  }, []);

  const current = scenarios[index] || scenarios[0];

  useEffect(() => {
    const handleKey = (e) => {
      if (status !== "playing") return;
      if (e.key === "ArrowLeft") setPosition(0);
      if (e.key === "ArrowRight") setPosition(2);

      if (e.key === "Enter") {
        submitChoice();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [status]);

  const submitChoice = () => {
    if (status !== "playing") return;
    if (hasAnswered) return; // ❌ prevent double submit
  
    const choice =
      position === 0 ? "FALSE" : position === 2 ? "TRUE" : null;
  
    if (!choice) return;
  
    setHasAnswered(true); // 🔒 lock submission
  
    const isCorrect = choice === current.correct;
  
    if (isCorrect) {
      setScore((s) => s + 10);
    } else {
      setLives((l) => l - 1);
    }
  
    setTimeout(() => {
      const remainingLives = isCorrect ? lives : lives - 1;

      if (
        index + 1 >= scenarios.length ||
        remainingLives <= 0
      ) {
        awardXp();
        setStatus("over");
      } else {
        setIndex((i) => i + 1);
        setPosition(1);
        setHasAnswered(false); // 🔓 unlock for next question
      }
    }, 500); // small delay for UX
  };

  const awardXp = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://smart-face-attendance-mfkt.onrender.com/api/student/gain-xp",
        { gameId: "logic-drift" },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
    } catch {
      // silently fail – XP is a bonus, not a blocker
    }
  };
  
  
  if (loadingAI) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 border">
        <p className="text-sm text-gray-600">Generating AI mission…</p>
      </div>
    );
  }
  
  return (

  

    <div className="bg-white rounded-2xl shadow p-6 border space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">🧠 Logic Drift</h2>
        <button onClick={onExit} className="text-red-500 text-sm">
          Exit
        </button>
      </div>

      {status === "playing" && (
        <>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
            {current.text}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {["FALSE", "?", "TRUE"].map((label, lane) => (
              <div
                key={label}
                className={`h-20 rounded-xl flex items-center justify-center border cursor-pointer ${
                  position === lane
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setPosition(lane)}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-sm">❤️ Lives: {lives}</span>
            <span className="text-sm">⭐ Score: {score}</span>
            <button
  onClick={submitChoice}
  disabled={hasAnswered}
  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
    hasAnswered
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 text-white"
  }`}
>
  Lock Choice
</button>

          </div>

          <p className="text-xs text-gray-500 mt-2">
            Hint: {current.hint}
          </p>
        </>
      )}

      {status === "over" && (
        <div className="text-center space-y-3">
          <h3 className="text-lg font-bold">🏁 Run Complete</h3>
          <p className="text-sm text-gray-600">
            Final Score: <b>{score}</b>
          </p>
          <p className="text-xs text-green-600">
  🎉 XP awarded for this run!
</p>

         

          <button
            onClick={onExit}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Games
          </button>
        </div>
      )}
    </div>
  );
}


