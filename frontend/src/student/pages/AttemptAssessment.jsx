import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";

export default function AttemptAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId");

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /** FETCH ASSESSMENT */
  useEffect(() => {
    async function fetchAssessment() {
      try {
       const res = await axios.get(
  `https://smart-face-attendance-mfkt.onrender.com/api/student-assessments/view/${id}`,
  { headers: { Authorization: "Bearer " + token } }
);


        setAssessment(res.data);

        // initialize empty answers
        const init = {};
        res.data.questions.forEach((q) => {
          init[q._id] = "";
        });
        setAnswers(init);

      } catch (err) {
        console.error("Assessment fetch error:", err);
        setError("Failed to load assessment.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [id]);

  /** UPDATE ANSWER */
  const updateAnswer = (qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: value,
    }));
  };

  /** SUBMIT ANSWERS */
  const submitNow = async () => {
    setSubmitting(true);

    try {
      // Convert answers object → array
      const answersArray = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
          isCorrect: null
        })
      );

      const payload = {
        assessmentId: id,
        studentId,
        answers: answersArray,
      };

      console.log("Submitting payload:", payload);


      await axios.post(
        "https://smart-face-attendance-mfkt.onrender.com/api/student/assessment/submit",
        payload,
        { headers: { Authorization: "Bearer " + token } }
      );

      alert("Assessment submitted successfully!");
      window.location.href = "/student/assessments";


    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  /** LOADING UI */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <Loader2 size={32} className="animate-spin" />
        <span className="ml-3 text-lg">Loading assessment...</span>
      </div>
    );
  }

  /** ERROR UI */
  if (error || !assessment) {
    return (
      <p className="text-center text-red-500 mt-10 font-semibold text-lg">
        {error}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* STICKY HEADER */}
      <div className="sticky top-0 bg-white shadow z-20 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-700">
          {assessment.title}
        </h1>

        <button
          disabled={submitting}
          onClick={submitNow}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <CheckCircle size={18} /> Submit
            </>
          )}
        </button>
      </div>

      {/* INSTRUCTIONS */}
      {assessment.instructions && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
            <p className="text-gray-700 whitespace-pre-wrap">
              {assessment.instructions}
            </p>
          </div>
        </div>
      )}

      {/* QUESTIONS SECTION */}
      <div className="px-6 space-y-6">
        {assessment.questions.map((q, index) => (
          <motion.div
            key={q._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow p-5 border"
          >
            <p className="font-semibold text-lg mb-3">
              {index + 1}. {q.text}
              <span className="text-sm text-gray-500 ml-2">
                ({q.marks} marks)
              </span>
            </p>

            {/* MCQ */}
            {q.type === "mcq" && (
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const selected = answers[q._id] === optIdx;

                  return (
                    <label
                      key={q._id + "_opt_" + optIdx}
                      className={`flex items-center p-3 rounded-lg cursor-pointer border transition ${
                        selected
                          ? "bg-indigo-50 border-indigo-500"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        checked={selected}
                        onChange={() => updateAnswer(q._id, optIdx)}
                        className="mr-3"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}

            {/* SHORT ANSWER */}
            {q.type === "short" && (
              <input
                type="text"
                value={answers[q._id]}
                onChange={(e) => updateAnswer(q._id, e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-300"
                placeholder="Your answer..."
              />
            )}

            {/* PARAGRAPH */}
            {q.type === "paragraph" && (
              <textarea
                rows={4}
                value={answers[q._id]}
                onChange={(e) => updateAnswer(q._id, e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-300"
                placeholder="Write your answer here..."
              ></textarea>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  );
}


