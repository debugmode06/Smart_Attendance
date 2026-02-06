import { FileCheck, TrendingUp, Users } from "lucide-react";

export default function AdminAttendance() {
  const attendance = [
    { class: "CSE-A", present: 42, absent: 3, total: 45 },
    { class: "CSE-B", present: 38, absent: 7, total: 45 },
    { class: "ECE-A", present: 40, absent: 5, total: 45 },
  ];

  const getPercentage = (present, total) => {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Attendance Analytics</h2>
              <p className="text-slate-300 text-sm mt-1">View attendance reports across all classes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {attendance.reduce((acc, a) => acc + a.present, 0)}
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium">Total Present</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">
              {attendance.reduce((acc, a) => acc + a.absent, 0)}
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium">Total Absent</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {Math.round(
                (attendance.reduce((acc, a) => acc + a.present, 0) /
                  attendance.reduce((acc, a) => acc + a.total, 0)) *
                  100
              )}%
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium">Overall Attendance</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Class-wise Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                <th className="p-4 text-left font-semibold text-slate-700">Class</th>
                <th className="p-4 text-left font-semibold text-slate-700">Total</th>
                <th className="p-4 text-left font-semibold text-slate-700">Present</th>
                <th className="p-4 text-left font-semibold text-slate-700">Absent</th>
                <th className="p-4 text-left font-semibold text-slate-700">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, idx) => {
                const percentage = getPercentage(a.present, a.total);
                return (
                  <tr
                    key={idx}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="p-4 font-medium text-slate-800">{a.class}</td>
                    <td className="p-4 text-slate-600">{a.total}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                        {a.present}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                        {a.absent}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${
                              percentage >= 80
                                ? "bg-green-500"
                                : percentage >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

