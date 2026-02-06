// src/admin/pages/ManageStudents.jsx
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, RefreshCw, Search,Users } from "lucide-react";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
  const years = [1, 2, 3, 4];
  const classOptions = [
    "CSE-A",
    "CSE-B",
    "CSE-C",
    "ECE-A",
    "EEE-A",
    "MECH-A",
  ]; // you can customize

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
    className: "",
  });

  const loadStudents = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/students", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) setStudents(data.students || []);
    } catch (err) {
      console.error("Load students error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      name: "",
      email: "",
      password: "",
      department: "",
      year: "",
      className: "",
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setIsEdit(true);
    setForm({
      id: s._id,
      name: s.name,
      email: s.email,
      password: "",
      department: s.department || "",
      year: s.year || "",
      className: s.className || "",
    });
    setShowModal(true);
  };

  const autoPassword = () => {
    const generated = Math.random().toString(36).slice(-8);
    setForm((f) => ({ ...f, password: generated }));
  };

  const saveStudent = async () => {
    if (!form.name || !form.email || (!isEdit && !form.password)) {
      alert("Name, email and password are required.");
      return;
    }

    if (!form.department || !form.year || !form.className) {
      alert("Department, year and class are required.");
      return;
    }

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `https://smart-face-attendance-mfkt.onrender.com/api/admin/students/${form.id}`
      : "https://smart-face-attendance-mfkt.onrender.com/api/admin/students";

    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        loadStudents();
      } else {
        console.log("Save student failed");
      }
    } catch (err) {
      console.error("Save student error:", err);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await fetch(`https://smart-face-attendance-mfkt.onrender.com/api/admin/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      loadStudents();
    } catch (err) {
      console.error("Delete student error:", err);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.className || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Student Management</h2>
              <p className="text-slate-300 text-sm mt-1">Manage student accounts and information</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email or class…"
          className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-slate-500 text-sm">Loading students…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <th className="p-4 text-left font-semibold text-slate-700">Name</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Email</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Department</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Year</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Class</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr
                    key={s._id}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="p-4 font-medium text-slate-800">{s.name}</td>
                    <td className="p-4 text-slate-600">{s.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                        {s.department || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{s.year || "-"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                        {s.className || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => openEditModal(s)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => deleteStudent(s._id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {isEdit ? "Edit Student" : "Add New Student"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {isEdit ? "New Password (optional)" : "Password"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="password"
                      placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                    />
                    {!isEdit && (
                      <button
                        onClick={autoPassword}
                        className="px-4 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Auto
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.year}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, year: e.target.value }))
                    }
                  >
                    <option value="">Select Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.className}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, className: e.target.value }))
                    }
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={saveStudent}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl mt-6 hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all duration-200"
              >
                {isEdit ? "Update Student" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


