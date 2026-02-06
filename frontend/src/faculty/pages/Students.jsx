import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, GraduationCap, ChevronRight } from "lucide-react";

export default function CollegeStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("https://smart-face-attendance-mfkt.onrender.com/api/student/all/full");
        setStudents(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to load students");
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const departments = ["CSE", "ECE", "ME", "EEE", "MBA"];
  const sections = ["A", "B", "C"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sortOptions = ["Name", "Reg No.", "CGPA"];

  const displayedStudents = useMemo(() => {
    let filtered = students.filter((s) => {
      const mDept = !selectedDept || s.dept === selectedDept;
      const mSection = !selectedSection || s.section === selectedSection;
      const mYear = !selectedYear || s.year === selectedYear;
      const mSearch =
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNo?.toLowerCase().includes(searchTerm.toLowerCase());
      return mDept && mSection && mYear && mSearch;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "Name") return a.name.localeCompare(b.name);
        if (sortBy === "Reg No.") return a.regNo.localeCompare(b.regNo);
        if (sortBy === "CGPA") return b.cgpa - a.cgpa;
      });
    }

    return filtered;
  }, [students, selectedDept, selectedSection, selectedYear, searchTerm, sortBy]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl text-blue-600">
        Loading Students...
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 text-center p-6 text-xl">{error}</div>
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
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Student Directory</h2>
              <p className="text-slate-300 text-sm mt-1">Browse and manage your students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or Reg No."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Section</option>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <select
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            {sortOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                <th className="p-4 text-left font-semibold text-slate-700 border-2 border-slate-300">Name</th>
                <th className="p-4 text-left font-semibold text-slate-700 border-2 border-slate-300 border-l-0">Reg No.</th>
                <th className="p-4 text-left font-semibold text-slate-700 border-2 border-slate-300 border-l-0">Dept</th>
                <th className="p-4 text-left font-semibold text-slate-700 border-2 border-slate-300 border-l-0">Section</th>
                <th className="p-4 text-left font-semibold text-slate-700 border-2 border-slate-300 border-l-0">Year</th>
                <th className="p-4 text-left font-semibold text-slate-700 border-2 border-slate-300 border-l-0">CGPA</th>
                <th className="p-4 text-right font-semibold text-slate-700 border-2 border-slate-300 border-l-0"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {displayedStudents.map((s, idx) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedStudent(s)}
                    className={`border-2 border-slate-300 border-t-0 hover:bg-slate-50/50 cursor-pointer transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="p-4 font-medium text-slate-800 border-r-2 border-slate-300">{s.name}</td>
                    <td className="p-4 text-slate-600 border-r-2 border-slate-300">{s.regNo}</td>
                    <td className="p-4 border-r-2 border-slate-300">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                        {s.dept}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 border-r-2 border-slate-300">{s.section}</td>
                    <td className="p-4 text-slate-600 border-r-2 border-slate-300">{s.year}</td>
                    <td className="p-4 border-r-2 border-slate-300">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                        {s.cgpa}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <ChevronRight className="inline text-indigo-600 w-4 h-4" />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Student Details</h3>
                <button
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                  onClick={() => setSelectedStudent(null)}
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <img
                    src={selectedStudent.avatar || "https://ui-avatars.com/api/?name=" + selectedStudent.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 shadow-lg"
                  />
                  <h3 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h3>
                  <p className="text-slate-500 text-sm">{selectedStudent.regNo}</p>
                  <p className="text-slate-500 text-sm mt-1">{selectedStudent.dept} • {selectedStudent.section}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Email</span>
                    <span className="text-slate-800">{selectedStudent.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Contact</span>
                    <span className="text-slate-800">{selectedStudent.contact || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">DOB</span>
                    <span className="text-slate-800">{selectedStudent.dob || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 font-medium">CGPA</span>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
                      {selectedStudent.cgpa}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium shadow-lg transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



