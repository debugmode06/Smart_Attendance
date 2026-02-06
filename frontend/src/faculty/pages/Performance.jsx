import { useState } from "react";

export default function FacultyPerformancePage() {
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterClass, setFilterClass] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = [
    {
      name: "John Doe",
      roll: "CS101",
      course: "Data Structures",
      class: "4A",
      marks: { assignment: 85, test: 90, final: 88 },
      attendance: 92,
      status: "Pass",
    },
    {
      name: "Alice Smith",
      roll: "CS102",
      course: "Database Systems",
      class: "4A",
      marks: { assignment: 78, test: 82, final: 80 },
      attendance: 88,
      status: "Pass",
    },
    {
      name: "Bob Johnson",
      roll: "CS103",
      course: "Data Structures",
      class: "4B",
      marks: { assignment: 55, test: 60, final: 58 },
      attendance: 70,
      status: "At Risk",
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      (filterCourse === "All" || s.course === filterCourse) &&
      (filterClass === "All" || s.class === filterClass) &&
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status) => {
    if (status === "Pass") return "bg-green-200 text-green-800";
    if (status === "At Risk") return "bg-yellow-200 text-yellow-800";
    if (status === "Fail") return "bg-red-200 text-red-800";
    return "bg-gray-200 text-gray-800";
  };

  const getBarWidth = (value) => `${Math.min(value, 100)}%`;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Student Performance</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <input
          type="text"
          placeholder="Search by student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg flex-1"
        />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option>All Courses</option>
          <option>Data Structures</option>
          <option>Database Systems</option>
          <option>Mathematics III</option>
        </select>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option>All Classes</option>
          <option>4A</option>
          <option>4B</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Students</p>
          <h3 className="text-3xl font-bold text-blue-700">{students.length}</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Average Marks</p>
          <h3 className="text-3xl font-bold text-blue-700">
            {Math.round(
              students.reduce((sum, s) => sum + s.marks.final, 0) / students.length
            )}
          </h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Pass</p>
          <h3 className="text-3xl font-bold text-green-700">
            {students.filter((s) => s.status === "Pass").length}
          </h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">At Risk / Fail</p>
          <h3 className="text-3xl font-bold text-red-700">
            {students.filter((s) => s.status !== "Pass").length}
          </h3>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Roll No</th>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-left">Class</th>
              <th className="p-2 text-left">Final Marks</th>
              <th className="p-2 text-left">Attendance %</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-gray-500 text-center">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.roll}</td>
                  <td className="p-2">{s.course}</td>
                  <td className="p-2">{s.class}</td>
                  <td className="p-2">{s.marks.final}</td>
                  <td className="p-2">{s.attendance}%</td>
                  <td
                    className={`p-2 font-semibold ${statusColor(
                      s.status
                    )} rounded-full text-center`}
                  >
                    {s.status}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">
              {selectedStudent.name} - {selectedStudent.course}
            </h3>
            <p>
              <span className="font-semibold">Roll No:</span> {selectedStudent.roll}
            </p>
            <p>
              <span className="font-semibold">Class:</span> {selectedStudent.class}
            </p>

            {/* Marks Bars */}
            <div className="mt-4 space-y-3">
              {Object.entries(selectedStudent.marks).map(([key, value]) => (
                <div key={key}>
                  <p className="font-semibold capitalize">{key} Marks: {value}</p>
                  <div className="w-full bg-gray-200 h-4 rounded-full">
                    <div
                      className={`h-4 rounded-full ${
                        value >= 85 ? "bg-green-500" : value >= 60 ? "bg-yellow-400" : "bg-red-500"
                      }`}
                      style={{ width: getBarWidth(value) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Bar */}
            <div className="mt-4">
              <p className="font-semibold">Attendance: {selectedStudent.attendance}%</p>
              <div className="w-full bg-gray-200 h-4 rounded-full">
                <div
                  className={`h-4 rounded-full ${
                    selectedStudent.attendance >= 90
                      ? "bg-green-500"
                      : selectedStudent.attendance >= 75
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                  style={{ width: getBarWidth(selectedStudent.attendance) }}
                ></div>
              </div>
            </div>

            <p className="mt-2 font-semibold">
              Status: <span className={`${statusColor(selectedStudent.status)} px-2 py-1 rounded-full`}>{selectedStudent.status}</span>
            </p>

            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold">
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

