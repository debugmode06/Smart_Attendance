import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  PlusCircle,
} from "lucide-react";

export default function StudentLeaveRequestModalPage() {
  const studentId = localStorage.getItem("studentId");

  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    type: "Leave",
    startDate: "",
    endDate: "",
    odDate: "",
    eventName: "",
    organizer: "",
    reason: "",
    notes: "",
    file: null,
  });

  // Fetch history
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `https://smart-face-attendance-mfkt.onrender.com/api/leave/student/${studentId}`
      );
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("studentId", studentId);

    const typeMapped =
      formData.type === "Leave"
        ? "leave"
        : formData.type === "OD"
        ? "od"
        : "permission";

    fd.append("type", typeMapped);

    if (typeMapped === "leave") {
      fd.append("fromDate", formData.startDate);
      fd.append("toDate", formData.endDate);
    }

    if (typeMapped === "od") {
      fd.append("date", formData.odDate);
      fd.append("eventName", formData.eventName);
      fd.append("organizer", formData.organizer);
    }

    fd.append("reason", formData.reason);
    fd.append("notes", formData.notes);

    if (formData.file) fd.append("attachment", formData.file);

    try {
      await axios.post("https://smart-face-attendance-mfkt.onrender.com/api/leave/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    }
  };

  const typeColor = {
    leave: "bg-blue-100 text-blue-700 border-blue-300",
    od: "bg-purple-100 text-purple-700 border-purple-300",
    permission: "bg-teal-100 text-teal-700 border-teal-300",
  };

  const statusBadge = (status) => {
    if (status === "pending")
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (status === "approved")
      return "bg-green-100 text-green-700 border-green-300";
    if (status === "rejected")
      return "bg-red-100 text-red-700 border-red-300";
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

  const statusIcon = (status) => {
    if (status === "pending")
      return <Clock className="w-4 h-4 text-yellow-600" />;
    if (status === "approved")
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === "rejected")
      return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Leave / OD / Permission</h2>
              <p className="text-slate-300 text-sm mt-1">Submit and track your leave requests</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200"
          >
            <PlusCircle size={20} />
            New Request
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-lg relative border-2 border-slate-200/50">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-5">
              Submit Request
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option>Leave</option>
                <option>OD</option>
                <option>Permission</option>
              </select>

              {formData.type === "Leave" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type === "OD" && (
                <>
                  <label className="text-sm font-medium">OD Date</label>
                  <input
                    type="date"
                    name="odDate"
                    value={formData.odDate}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    name="eventName"
                    placeholder="Event Name"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    name="organizer"
                    placeholder="Organizer"
                    value={formData.organizer}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </>
              )}

              <textarea
                name="reason"
                placeholder="Reason / Purpose"
                value={formData.reason}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />

              <textarea
                name="notes"
                placeholder="Additional Notes (optional)"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />

              <div className="flex items-center gap-3">
                <Upload size={18} className="text-gray-600" />
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request List */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Request History</h3>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No requests submitted yet.</p>
            <p className="text-gray-500 text-sm mt-2">Click "New Request" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, i) => (
              <div
                key={i}
                className="p-5 border-2 border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm border ${typeColor[
                      req.type
                    ]}`}
                  >
                    {req.type.toUpperCase()}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${statusBadge(
                      req.status
                    )}`}
                  >
                    {statusIcon(req.status)} {req.status}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} />
                    {req.type === "leave"
                      ? `${req.fromDate?.slice(0, 10)} → ${req.toDate?.slice(
                          0,
                          10
                        )}`
                      : req.type === "od"
                      ? req.date?.slice(0, 10)
                      : "Permission Request"}
                  </p>

                  <p className="text-gray-800 font-medium">
                    Reason: {req.reason}
                  </p>

                  {/* Attachment */}
                  {req.attachmentUrl && (
                    <a
                      href={`https://smart-face-attendance-mfkt.onrender.com${req.attachmentUrl}`}
                      className="text-blue-600 text-sm underline"
                      target="_blank"
                    >
                      View Attachment
                    </a>
                  )}

                  {req.status === "rejected" && req.rejectReason && (
                    <div className="mt-4 bg-red-50 border-2 border-red-300 p-4 rounded-xl flex gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertOctagon className="text-red-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-red-800 font-semibold text-sm">Rejected by Faculty</p>
                        <p className="text-red-700 text-sm mt-1">{req.rejectReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


