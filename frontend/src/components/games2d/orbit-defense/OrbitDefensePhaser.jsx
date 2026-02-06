import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import axios from "axios";

export default function OrbitDefensePhaser({ onExit }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  // 🔹 AI state
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [questions, setQuestions] = useState([]);

  /* =====================================================
     🧠 AI LOADER (SAFE, NON-BLOCKING)
     ===================================================== */
  useEffect(() => {
    const loadAI = async () => {
      try {
        setLoadingProgress(30);
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
        ]);

        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 400);
      }
    };

    loadAI();
  }, []);

  /* =====================================================
     🎮 PHASER GAME (STARTS AFTER AI READY)
     ===================================================== */
  useEffect(() => {
    if (loading || gameRef.current || !containerRef.current) return;

    class OrbitDefenseScene extends Phaser.Scene {
      constructor() {
        super("OrbitDefenseScene");

        this.questions = [];
        this.current = null;

        this.radius = 180;
        this.minRadius = 80;
        this.angleOffset = 0;

        this.enemies = [];
        this.selected = true;
        this.lock = false;
      }

      init(data) {
        this.questions = data.questions || [];
      }

      create() {
        // 🌌 Space background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x020617, 0x020617, 0x0f172a, 0x0f172a, 1);
        bg.fillRect(0, 0, 480, 480);

        // 🌍 Core
        this.add.circle(240, 260, 40, 0x38bdf8, 0.2);
        this.add.circle(240, 260, 26, 0x38bdf8);

        // 👾 Enemies
        for (let i = 0; i < 8; i++) {
          const enemy = this.add.circle(0, 0, 10, 0xef4444);
          this.enemies.push(enemy);
        }

        // 🧠 Question UI
        this.add.rectangle(240, 60, 420, 70, 0xffffff, 0.95);
        this.questionText = this.add
          .text(240, 60, "", {
            fontSize: "16px",
            color: "#020617",
            align: "center",
            wordWrap: { width: 380 },
          })
          .setOrigin(0.5);

        this.choiceText = this.add
          .text(240, 120, "CHOICE: TRUE", {
            fontSize: "14px",
            color: "#22c55e",
            fontStyle: "bold",
          })
          .setOrigin(0.5);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey("ENTER");

        this.nextQuestion();
      }

      nextQuestion() {
        this.lock = false;
        this.current =
          Phaser.Utils.Array.RemoveRandomElement(this.questions) ||
          this.current;

        this.questionText.setText(this.current.text);
      }

      update(_, delta) {
        this.angleOffset += delta * 0.0006;

        this.enemies.forEach((enemy, i) => {
          const angle =
            (Math.PI * 2 * i) / this.enemies.length + this.angleOffset;
          enemy.x = 240 + Math.cos(angle) * this.radius;
          enemy.y = 260 + Math.sin(angle) * this.radius;
        });

        if (this.lock) return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
          this.selected = false;
          this.choiceText.setText("CHOICE: FALSE");
          this.choiceText.setColor("#ef4444");
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
          this.selected = true;
          this.choiceText.setText("CHOICE: TRUE");
          this.choiceText.setColor("#22c55e");
        }

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
          this.resolve();
        }
      }

      resolve() {
        if (this.lock) return;
        this.lock = true;

        if (this.selected === this.current.answer) {
          this.radius += 25;
          this.flash(0x22c55e);
        } else {
          this.radius -= 20;
          this.flash(0xef4444);
        }

        if (this.radius <= this.minRadius) {
          this.endGame();
          return;
        }

        this.time.delayedCall(600, () => this.nextQuestion());
      }

      flash(color) {
        const ring = this.add.circle(240, 260, this.radius, color, 0.15);
        this.tweens.add({
          targets: ring,
          alpha: 0,
          duration: 400,
          onComplete: () => ring.destroy(),
        });
      }

      endGame() {
        this.scene.pause();
        this.add.rectangle(240, 240, 480, 480, 0x020617, 0.85);
        this.add
          .text(240, 220, "CORE BREACHED", {
            fontSize: "26px",
            color: "#ef4444",
            fontStyle: "bold",
          })
          .setOrigin(0.5);

        this.add
          .text(240, 260, "Mission Failed", {
            fontSize: "16px",
            color: "#e0f2fe",
          })
          .setOrigin(0.5);

        this.add
          .text(240, 300, "EXIT", {
            fontSize: "16px",
            backgroundColor: "#1e40af",
            color: "#ffffff",
            padding: { x: 12, y: 6 },
          })
          .setOrigin(0.5)
          .setInteractive()
          .on("pointerdown", () => onExit?.());
      }
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.CANVAS,
      width: 480,
      height: 480,
      parent: containerRef.current,
      physics: { default: "arcade" },
      scene: OrbitDefenseScene,
    });

    gameRef.current.scene.start("OrbitDefenseScene", {
      questions, // 🔹 AI + fallback passed here
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [loading, questions]);

  /* =====================================================
     ⏳ LINKEDIN-STYLE LOADING
     ===================================================== */
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 border">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-xl">🚀 Orbit Defense</h2>
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
              ? "Generating enemy intel…"
              : "Deploying defenses…"}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     🎮 GAME CONTAINER
     ===================================================== */
  return (
    <div className="bg-white rounded-xl shadow p-4 border">
      <div className="flex justify-between mb-2">
        <h2 className="font-bold">🚀 Orbit Defense</h2>
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


