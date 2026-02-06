// src/admin/pages/ManageClasses.jsx or AdminClasses.jsx
import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/classes", {
          headers: { Authorization: "Bearer " + token },
        });

        const data = await res.json();
        if (res.ok) {
          setClasses(data.classes || []);
        } else {
          console.error("Failed to load classes", data);
        }
      } catch (err) {
        console.error("Class load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const toggleExpand = (className) => {
    setExpanded((prev) => (prev === className ? null : className));
  };

  const filtered = classes.filter((c) =>
    c.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Class Overview</h2>
              <p className="text-slate-300 text-sm mt-1">View all classes, student strength & composition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search class (e.g., CSE-A)"
              className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Classes</p>
              <p className="text-2xl font-bold text-blue-600">{classes.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Students</p>
              <p className="text-2xl font-bold text-emerald-600">
                {classes.reduce((acc, c) => acc + (c.strength || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
            <p className="text-slate-500 text-sm">Loading classes…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No classes found</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200"
              >
                <button
                  onClick={() => toggleExpand(c.className)}
                  className="w-full flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800 text-base">{c.className}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.strength || 0} student{(c.strength || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      View students
                    </span>
                    {expanded === c.className ? (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </button>

                {expanded === c.className && c.students && (
                  <div className="mt-4 border-t border-slate-200 pt-4 max-h-64 overflow-y-auto">
                    {c.students.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No students in this class yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-left">
                              <th className="p-2.5 font-semibold text-slate-700">Name</th>
                              <th className="p-2.5 font-semibold text-slate-700">Email</th>
                              <th className="p-2.5 font-semibold text-slate-700">Dept</th>
                              <th className="p-2.5 font-semibold text-slate-700">Year</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.students.map((s, idx) => (
                              <tr
                                key={s._id}
                                className={`border-b border-slate-100 hover:bg-slate-50 ${
                                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                                }`}
                              >
                                <td className="p-2.5 font-medium text-slate-800">{s.name}</td>
                                <td className="p-2.5 text-slate-600">{s.email}</td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    {s.department || "-"}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-600">{s.year || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


