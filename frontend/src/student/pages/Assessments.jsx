import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileQuestion } from "lucide-react";

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  async function load() {
    try {
     const res = await axios.get(
  `https://smart-face-attendance-mfkt.onrender.com/api/student-assessments/${studentId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);



      // Sort pending → completed
      const sorted = res.data.sort(
        (a, b) => Number(a.submitted) - Number(b.submitted)
      );

      setAssessments(sorted);
    } catch (err) {
      console.error("Student assessments load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading assessments...
      </div>
    );

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Assessments</h1>
              <p className="text-slate-300 text-sm mt-1">Track and complete your assessments on time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {assessments.map((a, index) => (
          <motion.div
            key={a._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-200 hover:shadow-xl cursor-pointer ${
              a.submitted ? "border-green-300" : "border-slate-300"
            }`}
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">{a.title}</h3>
            <p className="text-sm text-slate-600 mb-3">{a.className}</p>

            <div className="mt-3 flex items-center gap-2 text-slate-700 mb-4">
              <Clock size={16} />
              <span className="text-sm font-medium">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4 mb-4">
              {a.submitted ? (
                <span className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold">
                  ✓ Completed
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold">
                  ⏳ Pending
                </span>
              )}
            </div>

            <div className="mt-6">
              {a.submitted ? (
                <button
                  onClick={() => navigate(`/student/assessment/view/${a._id}`)}
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> View Submission
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/student/assessment/${a._id}`)}
                  className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <FileQuestion size={18} /> Attempt Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


