import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "paragraph", label: "Paragraph" },
  { value: "short", label: "Short Answer" },
];

// -------------------------------------------------
// QUESTION CARD COMPONENT
// -------------------------------------------------
function QuestionCard({ q, index, updateQ, removeQ }) {
  const handleUpdate = (field, value) => {
    updateQ(q.id, { ...q, [field]: value });
  };

  const addOption = () => {
    handleUpdate("options", [...q.options, ""]);
  };

  const updateOption = (i, val) => {
    const arr = [...q.options];
    arr[i] = val;
    handleUpdate("options", arr);
  };

  return (
    <div className="p-5 bg-white shadow-xl rounded-2xl border mb-5 transition hover:shadow-2xl">
      <h4 className="text-sm text-gray-500 mb-1">Question {index + 1}</h4>

      {/* TEXT */}
      <input
        className="w-full border rounded-lg px-3 py-2.5 mb-3 focus:ring-2 focus:ring-indigo-400"
        placeholder="Enter Question"
        value={q.text}
        onChange={(e) => handleUpdate("text", e.target.value)}
      />

      {/* TYPE */}
      <select
        className="border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-400"
        value={q.type}
        onChange={(e) => handleUpdate("type", e.target.value)}
      >
        {QUESTION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* MARKS */}
      <input
        type="number"
        min={1}
        className="border rounded-lg px-3 py-2 mb-3 w-28 focus:ring-2 focus:ring-indigo-400"
        value={q.marks}
        onChange={(e) => handleUpdate("marks", Number(e.target.value) || 1)}
        placeholder="Marks"
      />

      {/* MCQ OPTIONS */}
      {q.type === "mcq" && (
        <div>
          <p className="font-semibold mb-1">Options</p>

          {q.options.map((opt, i) => (
            <div key={i} className="flex gap-3 items-center mb-2">
              <input
                className="border px-2 py-1 rounded-lg w-full"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
              />

              <input
                type="radio"
                name={`correct-${q.id}`}
                checked={q.correctOptionIndex === i}
                onChange={() => handleUpdate("correctOptionIndex", i)}
              />
            </div>
          ))}

          <button
            onClick={addOption}
            className="text-indigo-600 text-sm mt-2 hover:underline"
          >
            + Add Option
          </button>
        </div>
      )}

      {/* REMOVE */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => removeQ(q.id)}
          className="text-red-500 text-sm hover:underline"
        >
          Remove Question
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------
export default function Assessments() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("CSE-A");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [past, setPast] = useState([]);

  const token = localStorage.getItem("token");
  const facultyId = localStorage.getItem("facultyId");

  useEffect(() => {
    fetchPast();
  }, []);

  async function fetchPast() {
    try {
      const res = await axios.get(
        `https://smart-face-attendance-mfkt.onrender.com/api/faculty/assessments/all/${facultyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPast(res.data.assessments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        type: "mcq",
        marks: 1,
        options: [""],
        correctOptionIndex: null,
      },
    ]);
  };

  const updateQ = (id, updated) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const removeQ = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const save = async () => {
    if (!title || !className || !dueDate || questions.length === 0) {
      alert("Fill all fields and add at least one question");
      return;
    }

    const payload = {
      facultyId,
      title,
      className,
      dueDate,
      instructions,
      questions,
    };

    await axios.post(
      `https://smart-face-attendance-mfkt.onrender.com/api/faculty/assessments/create`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Assessment created successfully ✔");
    fetchPast();

    setTitle("");
    setDueDate("");
    setInstructions("");
    setQuestions([]);
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create Assessment</h1>
              <p className="text-slate-300 text-sm mt-1">Design and manage student assessments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 space-y-4">
        <input
          className="w-full border rounded-lg px-3 py-2.5"
          placeholder="Assessment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg px-3 py-2.5"
          placeholder="Instructions (optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />

        <div className="flex gap-4">
          <select
            className="border rounded-lg px-3 py-2"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            <option value="CSE-A">CSE-A</option>
            <option value="CSE-B">CSE-B</option>
            <option value="ECE-A">ECE-A</option>
            <option value="ECE-B">ECE-B</option>
          </select>

          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">Questions</h3>
          <button
            onClick={addQuestion}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg transition-all duration-200"
          >
            + Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No questions added yet. Click "Add Question" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                q={q}
                index={idx}
                updateQ={updateQ}
                removeQ={removeQ}
              />
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <button
          onClick={save}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg transition-all duration-200"
        >
          Save Assessment
        </button>
      </div>

      {/* Past Assessments */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Previous Assessments</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-slate-500 text-sm">Loading...</p>
          </div>
        ) : past.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 text-sm">No assessments yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((a) => (
              <div
                key={a._id}
                className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-bold text-lg text-slate-800 mb-2">{a.title}</h3>
                <p className="text-slate-600 text-sm mb-1">{a.className}</p>
                <p className="text-xs text-slate-500 mb-3">
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() =>
                    navigate(`/faculty/assessments/${a._id}/submissions`)
                  }
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-medium transition-colors"
                >
                  View Submissions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


