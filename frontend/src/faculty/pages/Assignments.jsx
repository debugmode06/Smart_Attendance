import axios from "axios";
import { useState, useEffect } from "react";

/* ---------------- MODAL COMPONENT ---------------- */
function CreateAssignmentModal({ isOpen, onClose, refresh }) {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("CSE-A");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const facultyId = localStorage.getItem("facultyId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("facultyId", facultyId);
      formData.append("title", title);
      formData.append("className", className);
      formData.append("dueDate", dueDate);
      formData.append("description", description);
      formData.append("note", note);
      if (file) formData.append("file", file);

      await axios.post(
        "https://smart-face-attendance-mfkt.onrender.com/api/faculty/assignments/create",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Assignment created!");
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-indigo-700">
          Create Assignment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Assignment Title"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs">Class</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="CSE-A">CSE-A</option>
                <option value="CSE-B">CSE-B</option>
                <option value="ECE-A">ECE-A</option>
                <option value="ECE-B">ECE-B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs">Due Date</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <textarea
            placeholder="Description (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <textarea
            placeholder="Note to students (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            {submitting ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */
export default function Assignments() {
  const [openModal, setOpenModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const token = localStorage.getItem("token");
  const facultyId = localStorage.getItem("facultyId");

  async function fetchAssignments() {
    try {
      const res = await axios.get(
        `https://smart-face-attendance-mfkt.onrender.com/api/faculty/assignments/all/${facultyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Assignments</h2>
              <p className="text-slate-300 text-sm mt-1">Create and manage student assignments</p>
            </div>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all duration-200"
          >
            + Create Assignment
          </button>
        </div>
      </div>

      {/* Assignment List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 text-sm">No assignments posted yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((a) => (
              <div key={a._id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                <h3 className="font-semibold text-slate-800 mb-2">{a.title}</h3>
                <div className="space-y-1.5">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Class:</span> {a.className}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium">Due:</span> <b>{new Date(a.dueDate).toLocaleDateString()}</b>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <CreateAssignmentModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        refresh={fetchAssignments}
      />
    </div>
  );
}



