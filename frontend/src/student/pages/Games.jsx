import { useState, useEffect } from "react";
import axios from "axios";
import "./games.css"; // we will create this next

export default function Games() {
  const [xp, setXp] = useState(0);
  const [activeGame, setActiveGame] = useState(null);
  const [completed, setCompleted] = useState([]);

  const games = [
    {
      id: "sdlc",
      name: "SDLC Order Game",
      concept: "Software Development Life Cycle",
      difficulty: "Easy",
      xp: 20,
      instructions: "Arrange the SDLC phases in the correct order."
    },
    {
      id: "bug",
      name: "Bug Hunter",
      concept: "Debugging / Testing",
      difficulty: "Medium",
      xp: 30,
      instructions: "Identify bugs in the given code snippet."
    },
    {
      id: "usecase",
      name: "Use-Case Match",
      concept: "Use Cases & Actors",
      difficulty: "Easy",
      xp: 20,
      instructions: "Match the use-case to the correct actor."
    }
  ];

  useEffect(() => {
    axios.get("/api/student/xp").then((res) => {
      setXp(res.data.totalXP);
      setCompleted(res.data.completedGames || []);
    });
  }, []);

  const handleComplete = async (game) => {
    const res = await axios.post("/api/student/gain-xp", {
      gameId: game.id,
    });

    alert(`You earned ${res.data.awardedXP} XP 🎉`);

    setXp(res.data.newTotalXP);
    setCompleted([...completed, game.id]);
  };

  return (
    <div className="games-container">
      <h1>🎮 Software Engineering – Games</h1>

      <div className="xp-box">
        ⭐ XP: <b>{xp}</b>
      </div>

      <div className="game-list">
        <div className="sidebar">
          {games.map((g) => (
            <div
              key={g.id}
              className={`game-tab ${activeGame?.id === g.id ? "active" : ""}`}
              onClick={() => setActiveGame(g)}
            >
              <div>{g.name}</div>
              {completed.includes(g.id) ? (
                <span className="done">✔ Done</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="game-content">
          {activeGame ? (
            <>
              <h2>{activeGame.name}</h2>
              <p><b>Concept:</b> {activeGame.concept}</p>

              <div className="instructions">
                <h3>How to Play</h3>
                <p>{activeGame.instructions}</p>
              </div>

              <button
                className="complete-btn"
                onClick={() => handleComplete(activeGame)}
              >
                ✔ I Finished This Game (Get {activeGame.xp} XP)
              </button>
            </>
          ) : (
            <h3>Select a game from left</h3>
          )}
        </div>
      </div>
    </div>
  );
}

