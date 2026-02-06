import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import axios from "axios";

export default function LogicRunnerUltraAI({ onExit }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  // 🔹 AI loading state (ADDED, NOTHING REMOVED)
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [questions, setQuestions] = useState([]);

  // =========================================================
  // 🔹 AI LOADER (USES YOUR WORKING ENDPOINT)
  // =========================================================
  useEffect(() => {
    const loadAI = async () => {
      try {
        setLoadingProgress(25);
        const token = localStorage.getItem("token");

        const res = await axios.post(
          "https://smart-face-attendance-mfkt.onrender.com/api/games/ai/logic-drift",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (Array.isArray(res.data) && res.data.length > 0) {
          setLoadingProgress(80);
          setQuestions(res.data);
          setLoadingProgress(100);
          setTimeout(() => setLoading(false), 400);
          return;
        }

        throw new Error("Invalid AI response");
      } catch (err) {
        console.log("⚠️ AI unavailable, using fallback");

        setLoadingProgress(80);
        setQuestions([
          { text: "HTTP is stateless", answer: true },
          { text: "MongoDB uses tables", answer: false },
          { text: "DFS uses a stack", answer: true },
          { text: "CSS is a programming language", answer: false },
          { text: "React uses Virtual DOM", answer: true },
          { text: "Python is compiled", answer: false },
        ]);

        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 400);
      }
    };

    loadAI();
  }, []);

  // =========================================================
  // 🎮 PHASER GAME (STARTS ONLY AFTER AI READY)
  // =========================================================
  useEffect(() => {
    if (loading || gameRef.current || !containerRef.current) return;

    class LogicRunnerScene extends Phaser.Scene {
      constructor() {
        super("LogicRunnerScene");

        this.score = 0;
        this.lives = 3;
        this.speed = 120;
        this.correctStreak = 0;

        this.playerLane = 0;
        this.lanes = [160, 320];

        this.boxes = [];
        this.lock = false;
        this.questions = [];
        this.current = null;
      }

      init(data) {
        // 🔹 RECEIVE AI QUESTIONS
        this.questions = data.questions || [];
      }

      create() {
        // 🌌 Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f172a, 0x020617, 0x020617, 0x0f172a, 1);
        bg.fillRect(0, 0, 480, 480);

        // 🎨 Textures
        const g = this.add.graphics();

        g.fillGradientStyle(0x22c55e, 0x16a34a, 0x16a34a, 0x22c55e, 1);
        g.fillRoundedRect(0, 0, 140, 55, 12);
        g.generateTexture("trueBox", 140, 55);
        g.clear();

        g.fillGradientStyle(0xef4444, 0xdc2626, 0xdc2626, 0xef4444, 1);
        g.fillRoundedRect(0, 0, 140, 55, 12);
        g.generateTexture("falseBox", 140, 55);
        g.clear();

        g.fillStyle(0x38bdf8);
        g.fillRoundedRect(0, 0, 45, 45, 10);
        g.generateTexture("playerTex", 45, 45);
        g.destroy();

        // UI
        this.add.text(240, 20, "LOGIC RUNNER • AI", {
          fontSize: "22px",
          color: "#e0f2fe",
          fontStyle: "bold",
        }).setOrigin(0.5);

        this.scoreText = this.add.text(20, 55, "Score: 0", {
          fontSize: "14px",
          color: "#e0f2fe",
        });

        this.livesText = this.add.text(350, 55, "❤️❤️❤️", {
          fontSize: "14px",
          color: "#fca5a5",
        });

        this.card = this.add.graphics();
        this.card.fillStyle(0xf8fafc, 0.95);
        this.card.fillRoundedRect(40, 95, 400, 70, 16);

        this.questionText = this.add.text(240, 130, "", {
          fontSize: "18px",
          color: "#020617",
          align: "center",
          wordWrap: { width: 360 },
        }).setOrigin(0.5);

        this.feedbackText = this.add.text(240, 180, "", {
          fontSize: "16px",
          fontStyle: "bold",
        }).setOrigin(0.5);

        this.player = this.physics.add.image(
          this.lanes[this.playerLane],
          420,
          "playerTex"
        );
        this.player.body.setAllowGravity(false);
        this.player.body.setImmovable(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.nextRound();
      }

      nextRound() {
        this.clearBoxes();
        this.lock = false;

        this.current = Phaser.Utils.Array.RemoveRandomElement(this.questions);
        if (!this.current) {
          this.endGame();
          return;
        }

        this.questionText.setText(this.current.text);
        this.feedbackText.setText("");

        this.spawnBox(true, this.lanes[0]);
        this.spawnBox(false, this.lanes[1]);
      }

      spawnBox(value, x) {
        const key = value ? "trueBox" : "falseBox";
        const box = this.physics.add.image(x, -40, key);
        box.body.setVelocityY(this.speed);
        box.body.setAllowGravity(false);
        box.value = value;

        const label = this.add.text(x, -40, value ? "TRUE" : "FALSE", {
          fontSize: "18px",
          color: "#ffffff",
          fontStyle: "bold",
        }).setOrigin(0.5);

        box.label = label;
        this.boxes.push(box);
      }

      clearBoxes() {
        this.boxes.forEach((b) => {
          b.label?.destroy();
          b.destroy();
        });
        this.boxes = [];
      }

      update() {
        if (this.lock) return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.playerLane = 0;
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.playerLane = 1;

        this.player.x = this.lanes[this.playerLane];

        this.boxes.forEach((box) => {
          box.label.x = box.x;
          box.label.y = box.y;

          if (box.y >= 390 && !this.lock) {
            this.lock = true;
            this.evaluate();
          }
        });
      }

      evaluate() {
        const chosen = this.playerLane === 0;

        if (chosen === this.current.answer) {
          this.score += 10;
          this.correctStreak++;
          this.scoreText.setText(`Score: ${this.score}`);
          this.feedbackText.setColor("#22c55e");
          this.feedbackText.setText("✔ CORRECT!");

          if (this.correctStreak % 2 === 0) this.speed += 10;
        } else {
          this.lives--;
          this.correctStreak = 0;
          this.feedbackText.setColor("#ef4444");
          this.feedbackText.setText("✖ WRONG!");
          this.livesText.setText("❤️".repeat(this.lives));

          if (this.lives <= 0) {
            this.endGame();
            return;
          }
        }

        this.time.delayedCall(700, () => this.nextRound());
      }

      endGame() {
        this.scene.pause();
        this.add.rectangle(240, 240, 480, 480, 0x020617, 0.85);
        this.add.text(240, 210, "GAME OVER", {
          fontSize: "28px",
          color: "#e0f2fe",
        }).setOrigin(0.5);

        this.add.text(240, 255, `Final Score: ${this.score}`, {
          fontSize: "18px",
          color: "#e0f2fe",
        }).setOrigin(0.5);
      }
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.CANVAS,
      width: 480,
      height: 480,
      parent: containerRef.current,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 } },
      },
      scene: LogicRunnerScene,
    });

    gameRef.current.scene.start("LogicRunnerScene", {
      questions, // 🔹 AI + fallback questions passed here
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [loading, questions]);

  // =========================================================
  // 🔹 LINKEDIN-STYLE LAZY LOADING (ADDED)
  // =========================================================
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 border">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-xl">🧠 Logic Runner</h2>
          <button onClick={onExit} className="text-red-500 text-sm">
            Exit
          </button>
        </div>

        <div className="space-y-4">
          <div
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: `${loadingProgress}%` }}
          />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
          <div className="text-center text-sm text-gray-600">
            {loadingProgress < 50
              ? "Connecting to AI…"
              : loadingProgress < 90
              ? "Generating questions…"
              : "Almost ready…"}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 🎮 GAME CONTAINER
  // =========================================================
  return (
    <div className="bg-white rounded-xl shadow p-4 border">
      <div className="flex justify-between mb-2">
        <h2 className="font-bold">🧠 Logic Runner</h2>
        <button onClick={onExit} className="text-red-500 text-sm">
          Exit
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ width: 480, height: 480, margin: "0 auto" }}
      />
    </div>
  );
}


