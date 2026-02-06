import axios from "axios";
import { useEffect, useState } from "react";

// ICONS
import { CalendarDays, FileDown, Clock } from "lucide-react";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [facultyMap, setFacultyMap] = useState({});
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  // ------------------------------
  // Fetch assignments + faculty subjects
  // ------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://smart-face-attendance-mfkt.onrender.com/api/student/assignments/${studentId}`
        );

        const assignmentsData = res.data || [];
        setAssignments(assignmentsData);

        // Fetch faculty details for subject lookup
        const facultyIds = [
          ...new Set(assignmentsData.map((a) => a.facultyId)),
        ];

        const map = {};
        for (let fId of facultyIds) {
          if (!fId) continue;
          const fRes = await axios.get(
            `https://smart-face-attendance-mfkt.onrender.com/api/faculty/profile/${fId}`
          );
          map[fId] = fRes.data.subject;
        }
        setFacultyMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading)
    return <div className="p-4 text-lg text-gray-600">Loading assignments...</div>;

  // ------------------------------
  // Calculate Priority
  // ------------------------------
  const getPriority = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = (due - now) / (1000 * 60 * 60 * 24); // days left

    if (diff <= 2) return { level: "High", color: "red" };
    if (diff <= 6) return { level: "Medium", color: "orange" };
    return { level: "Low", color: "green" };
  };

  // ------------------------------
  // Calculate Meter Percentage
  // ------------------------------
  const getProgress = (createdAt, dueDate) => {
    const start = new Date(createdAt);
    const end = new Date(dueDate);
    const now = new Date();

    const total = end - start;
    const elapsed = now - start;

    let pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return pct;
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
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Assignments</h2>
              <p className="text-slate-300 text-sm mt-1">Track deadlines and download assignment instructions</p>
            </div>
          </div>
        </div>
      </div>

      {assignments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-12 text-center">
          <FileDown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-semibold">No assignments available</p>
          <p className="text-slate-500 text-sm mt-2">Check back later for new assignments</p>
        </div>
      )}

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((a) => {
          const priority = getPriority(a.dueDate);
          const progress = getProgress(a.createdAt, a.dueDate);
          const subject = facultyMap[a.facultyId] || "General";

          return (
            <div
              key={a._id}
              className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-300 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex-1 pr-2">{a.title}</h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold text-white rounded-lg ${
                    priority.level === "High"
                      ? "bg-red-600"
                      : priority.level === "Medium"
                      ? "bg-amber-600"
                      : "bg-green-600"
                  }`}
                >
                  {priority.level}
                </span>
              </div>

              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border-2 border-blue-300 mb-3">
                {subject}
              </div>

              {a.description && (
                <p className="mt-3 text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border-2 border-slate-300">{a.description}</p>
              )}

              {a.note && (
                <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <b>Note:</b> {a.note}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
                <CalendarDays size={18} className="text-blue-600" />
                <span className="font-semibold text-slate-800">
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </span>
              </div>

              {/* PROGRESS METER */}
              <div className="mt-4 flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={
                        priority.level === "High"
                          ? "#dc2626"
                          : priority.level === "Medium"
                          ? "#f59e0b"
                          : "#16a34a"
                      }
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={
                        2 * Math.PI * 28 * (1 - progress / 100)
                      }
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Time Progress</p>
                  <p className="font-semibold text-gray-800">
                    {progress < 100
                      ? "Keep going!"
                      : "Due date reached"}
                  </p>
                </div>
              </div>

              {a.fileUrl && (
                <a
                  href={`https://smart-face-attendance-mfkt.onrender.com${a.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  <FileDown size={18} /> Download Attachment
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


