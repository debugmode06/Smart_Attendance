import axios from "axios";
import { useEffect, useState } from "react";

export default function AssessmentSubmissions() {
  const facultyId = localStorage.getItem("facultyId");
  const token = localStorage.getItem("token");

  const [assessments, setAssessments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ----------------------------------------------------
      FETCH ALL ASSESSMENTS OF FACULTY
  ---------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://smart-face-attendance-mfkt.onrender.com/api/faculty/assessments/all/${facultyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAssessments(res.data.assessments);
      } catch (err) {
        console.error("Error loading assessments:", err);
      }
    };

    fetchData();
  }, []);

  /* ----------------------------------------------------
      OPEN ONE ASSESSMENT AND LOAD SUBMISSIONS
  ---------------------------------------------------- */
  const openAssessment = async (ass) => {
    setSelected(ass);
    setLoading(true);

    try {
      const res = await axios.get(
        `https://smart-face-attendance-mfkt.onrender.com/api/faculty/assessments/${ass._id}/submissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmissions(res.data.submissions);
    } catch (err) {
      console.error("Error loading submissions:", err);
    }

    setLoading(false);
  };

  /* ----------------------------------------------------
      SAVE MARKS FOR A SINGLE STUDENT
  ---------------------------------------------------- */
  const saveMarks = async (submissionId, detailedMarks) => {
    const total = Object.values(detailedMarks).reduce((a, b) => a + b, 0);

    await axios.post(
      `https://smart-face-attendance-mfkt.onrender.com/api/faculty/assessments/${submissionId}/grade`,
      {
        detailedMarks,
        totalMarks: total,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Marks Saved ✔");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-transparent bg-clip-text mb-6">
        Assessment Submissions
      </h1>

      {/* -------------------------------------------
            ASSESSMENT LIST
      ------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {assessments.map((a) => (
          <div
            key={a._id}
            onClick={() => openAssessment(a)}
            className="p-5 bg-white border shadow rounded-2xl cursor-pointer hover:shadow-xl transition"
          >
            <h3 className="font-bold text-lg">{a.title}</h3>
            <p className="text-gray-600">{a.className}</p>
            <p className="text-xs text-gray-500 mt-1">
              Due: {new Date(a.dueDate).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* -------------------------------------------
            SUBMISSIONS PANEL
      ------------------------------------------- */}
      {selected && (
        <div className="mt-10 p-6 bg-white rounded-2xl shadow-xl border">

          <h2 className="text-2xl font-bold mb-4">
            {selected.title} — Submissions
          </h2>

          {loading ? (
            <p>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p className="text-gray-600">No submissions yet.</p>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub) => (
                <SubmissionCard
                  key={sub._id}
                  sub={sub}
                  assessment={selected}
                  saveMarks={saveMarks}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------
      SUBMISSION CARD COMPONENT
---------------------------------------------------- */
function SubmissionCard({ sub, assessment, saveMarks }) {
  const [marks, setMarks] = useState(sub.detailedMarks || {});

  const updateMark = (qid, value) => {
    setMarks((prev) => ({
      ...prev,
      [qid]: Number(value),
    }));
  };

  const total = Object.values(marks).reduce((a, b) => a + b, 0);

  return (
    <div className="border p-4 rounded-xl shadow bg-gray-50">

      {/* Header */}
      <div className="flex justify-between">
        <h3 className="font-semibold">
          {sub.studentId?.name} ({sub.studentId?.className})
        </h3>
        <span className="text-xs text-gray-500">
          {new Date(sub.submittedAt).toLocaleString()}
        </span>
      </div>

      {/* Answers */}
      <div className="mt-4 space-y-4">
        {assessment.questions.map((q, i) => {
          const answerObj = sub.answers.find(a => a.questionId === q._id);
const studentAnswer = answerObj ? answerObj.answer : "";

          return (
            <div key={q.id || q._id} className="p-3 bg-white rounded-lg border">
              <p className="font-medium">
                {i + 1}. {q.text}
              </p>

              {/* MCQ */}
              {q.type === "mcq" ? (
                <p
                  className={
                    studentAnswer === q.correctOptionIndex
                      ? "text-green-700 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  Answer: {q.options[studentAnswer] || "Not answered"}
                </p>
              ) : (
                <p className="text-gray-700">Answer: {studentAnswer}</p>
              )}

              {/* MARKS INPUT */}
              <div className="flex items-center mt-2">
                <input
                  type="number"
                  className="border px-2 py-1 rounded w-24"
                  placeholder="Marks"
                  value={marks[q._id] || marks[q.id] || ""}
                  onChange={(e) =>
                    updateMark(q._id || q.id, e.target.value)
                  }
                />
                <span className="text-xs ml-2 text-gray-500">/ {q.marks}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-4 flex justify-between items-center">
        <p className="font-semibold">Total: {total} marks</p>

        <button
          onClick={() => saveMarks(sub._id, marks)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save Marks
        </button>
      </div>
    </div>
  );
}



