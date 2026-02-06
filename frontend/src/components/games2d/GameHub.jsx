import { useState } from "react";
import FreePeriodGate from "./FreePeriodGate";
import LogicDriftPhaser from "./logic-drift/LogicDriftPhaser";
import OrbitDefensePhaser from "./orbit-defense/OrbitDefensePhaser";

export default function GameHub({ isFreePeriod, freeLoading }) {
  const [activeGame, setActiveGame] = useState(null);

  if (freeLoading || !isFreePeriod) {
    return (
      <FreePeriodGate
        freeLoading={freeLoading}
        isFreePeriod={isFreePeriod}
      />
    );
  }

  /* ===============================
     🎮 GAME HUB HOME
     =============================== */
  if (!activeGame) {
    return (
      <div className="space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl p-6 shadow">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🎮 Game Hub</h2>
              <p className="text-sm opacity-90">
                Learn through play. Defend. Decide. Win.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                💎 144
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                🪙 2,321
              </div>
            </div>
          </div>
        </div>

        {/* GAMES GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LOGIC DRIFT CARD */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow p-6 border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl">
                🧠
              </div>
              <div>
                <h3 className="font-bold text-lg">Logic Drift</h3>
                <p className="text-sm text-gray-600">
                  Decide fast. Commit. Survive the logic flow.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveGame("logic-drift")}
              className="mt-5 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              ▶ Play Logic Drift
            </button>
          </div>

          {/* ORBIT DEFENSE CARD */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow p-6 border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-xl">
                🚀
              </div>
              <div>
                <h3 className="font-bold text-lg">Orbit Defense</h3>
                <p className="text-sm text-gray-600">
                  Defend the core. Knowledge controls the battlefield.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveGame("orbit-defense")}
              className="mt-5 w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              ▶ Play Orbit Defense
            </button>
          </div>
        </div>

        {/* LEADERBOARD PREVIEW (STATIC FOR NOW) */}
        <div className="bg-white rounded-3xl shadow p-6 border">
          <h3 className="font-semibold text-lg mb-4">🏆 Leaderboard</h3>

          {[
            { name: "Brody Bellson", score: 65322, rank: 1 },
            { name: "Jack Nickson", score: 48205, rank: 2 },
            { name: "Timothy Bell", score: 21780, rank: 3 },
          ].map((user) => (
            <div
              key={user.rank}
              className="flex items-center justify-between py-3 border-b last:border-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  🤖
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    💎 {user.score.toLocaleString()}
                  </p>
                </div>
              </div>

              <span className="font-bold text-indigo-600">
                #{user.rank}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ===============================
     🎮 GAME ROUTING
     =============================== */
  if (activeGame === "logic-drift") {
    return (
      <LogicDriftPhaser
        onExit={() => setActiveGame(null)}
        onComplete={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === "orbit-defense") {
    return (
      <OrbitDefensePhaser
        onExit={() => setActiveGame(null)}
      />
    );
  }

  return null;
}

