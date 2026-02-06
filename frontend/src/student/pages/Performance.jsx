import { useState } from "react";
import {
  TrendingUp,
  BarChart2,
  Award,
  Activity,
  PieChart,
  Brain,
  FileDown,
} from "lucide-react";

export default function StudentPerformancePage() {
  const [selectedSubject, setSelectedSubject] = useState(null);

  // STATIC DEMO DATA (replace later with backend)
  const student = {
    name: "John Doe",
    roll: "CS101",
    class: "4A",
    subjects: [
      {
        course: "Data Structures",
        marks: { assignment: 85, test: 90, final: 88 },
        attendance: 92,
      },
      {
        course: "Database Systems",
        marks: { assignment: 78, test: 82, final: 80 },
        attendance: 88,
      },
      {
        course: "Mathematics III",
        marks: { assignment: 65, test: 70, final: 68 },
        attendance: 75,
      },
    ],
  };

  const getAverage = (m) => Math.round((m.assignment + m.test + m.final) / 3);
  const avgAttendance = Math.round(
    student.subjects.reduce((s, x) => s + x.attendance, 0) /
      student.subjects.length
  );
  const avgMarks = Math.round(
    student.subjects.reduce((s, x) => s + getAverage(x.marks), 0) /
      student.subjects.length
  );

  const overallStatus = avgMarks >= 60 ? "Pass" : "At Risk";
  const statusColor = (s) =>
    s === "Pass"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const barColor = (v) =>
    v >= 85 ? "bg-green-500" : v >= 60 ? "bg-yellow-400" : "bg-red-500";

  const getBarWidth = (v) => `${Math.min(v, 100)}%`;

  // Radar chart values (normalised)
  const radarData = [
    { label: "Assignments", value: avgMarks },
    { label: "Tests", value: avgMarks - 5 },
    { label: "Finals", value: avgMarks - 2 },
    { label: "Attendance", value: avgAttendance },
    { label: "Consistency", value: avgMarks - 3 },
  ];

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Performance Dashboard</h2>
              <p className="text-slate-300 text-sm mt-1">Smart AI-powered academic insights & progress tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-300">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl group-hover:blur-3xl transition-all" />
          <p className="text-gray-600 text-sm font-semibold mb-2">Total Subjects</p>
          <h3 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {student.subjects.length}
          </h3>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-fit shadow-lg">
            <Award className="text-white" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-300">
          <p className="text-slate-600 text-sm font-semibold mb-2">Average Marks</p>
          <h3 className="text-4xl font-bold text-slate-800 mb-3">{avgMarks}</h3>
          <div className="p-3 bg-green-600 rounded-lg w-fit">
            <TrendingUp className="text-white" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-300">
          <p className="text-slate-600 text-sm font-semibold mb-2">Attendance</p>
          <h3 className="text-4xl font-bold text-slate-800 mb-3">{avgAttendance}%</h3>
          <div className="p-3 bg-orange-600 rounded-lg w-fit">
            <Activity className="text-white" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-300">
          <p className="text-slate-600 text-sm font-semibold mb-2">Overall Status</p>
          <span
            className={`mt-2 inline-block px-5 py-2 text-xl font-bold rounded-lg ${
              overallStatus === "Pass"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {overallStatus}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="text-purple-600" /> Skill Radar Analysis
        </h3>

        <div className="relative w-64 h-64 mx-auto">
          <svg width="100%" height="100%" viewBox="0 0 200 200">
            {/* Radar Axes */}
            {radarData.map((d, i) => {
              const angle = (Math.PI * 2 * i) / radarData.length;
              const x = 100 + 80 * Math.cos(angle);
              const y = 100 + 80 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="#d1d5db"
                />
              );
            })}

            {/* Radar Fill */}
            <polygon
              fill="rgba(124, 58, 237, 0.2)"
              stroke="#7c3aed"
              strokeWidth="2"
              points={radarData
                .map((d, i) => {
                  const angle = (Math.PI * 2 * i) / radarData.length;
                  const radius = (d.value / 100) * 80;
                  const x = 100 + radius * Math.cos(angle);
                  const y = 100 + radius * Math.sin(angle);
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>

          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-700">
            Finals
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-700">
            Attendance
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-6 overflow-x-auto">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
          <BarChart2 className="text-indigo-600" /> Subject-wise Breakdown
        </h3>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b-2 border-slate-300">
              <th className="p-3 text-left font-semibold text-slate-700 border-r-2 border-slate-300">Subject</th>
              <th className="p-3 font-semibold text-slate-700 border-r-2 border-slate-300">Avg Marks</th>
              <th className="p-3 font-semibold text-slate-700 border-r-2 border-slate-300">Attendance</th>
              <th className="p-3 font-semibold text-slate-700 border-r-2 border-slate-300">Status</th>
              <th className="p-3 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects.map((s, i) => {
              const avg = getAverage(s.marks);
              const status = avg >= 60 ? "Pass" : "At Risk";

              return (
                <tr
                  key={i}
                  className={`border-b-2 border-slate-300 hover:bg-slate-50 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <td className="p-3 font-medium text-slate-800 border-r-2 border-slate-300">{s.course}</td>
                  <td className="p-3 text-slate-700 border-r-2 border-slate-300">{avg}</td>
                  <td className="p-3 text-slate-700 border-r-2 border-slate-300">{s.attendance}%</td>
                  <td className="p-3 border-r-2 border-slate-300">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${statusColor(status)}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedSubject(s)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SUBJECT DETAIL MODAL */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl relative">

            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold">
              {selectedSubject.course} – Detailed Report
            </h3>

            <div className="mt-4 space-y-5">
              {/* Mark Bars */}
              {Object.entries(selectedSubject.marks).map(([k, v]) => (
                <div key={k}>
                  <p className="font-semibold capitalize">
                    {k} Marks: {v}
                  </p>
                  <div className="w-full h-4 bg-gray-200 rounded-full">
                    <div
                      className={`h-4 rounded-full transition-all ${barColor(
                        v
                      )}`}
                      style={{ width: getBarWidth(v) }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Attendance */}
              <div>
                <p className="font-semibold">
                  Attendance: {selectedSubject.attendance}%
                </p>
                <div className="w-full h-4 bg-gray-200 rounded-full">
                  <div
                    className={`h-4 rounded-full ${barColor(
                      selectedSubject.attendance
                    )}`}
                    style={{
                      width: getBarWidth(selectedSubject.attendance),
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <button className="mt-5 w-full bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800">
              <FileDown size={18} /> Export Report (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

