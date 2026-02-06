import { useEffect, useState } from "react";
import axios from "axios";

export default function LeaveApproval() {
  const facultyId = localStorage.getItem("facultyId");
  const [requests, setRequests] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `https://smart-face-attendance-mfkt.onrender.com/api/leave/faculty/${facultyId}`
      );
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      await axios.post(`https://smart-face-attendance-mfkt.onrender.com/api/leave/approve/${id}`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to approve");
    }
  };

  const rejectRequest = async () => {
    try {
      await axios.post(
        `https://smart-face-attendance-mfkt.onrender.com/api/leave/reject/${rejectModal.id}`,
        { reason: rejectReason }
      );
      setRejectModal({ open: false, id: null });
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to reject");
    }
  };

  const statusColor = (status) => {
    if (status === "approved") return "bg-green-200 text-green-800";
    if (status === "rejected") return "bg-red-200 text-red-800";
    return "bg-yellow-200 text-yellow-800";
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Leave / OD Approvals</h2>

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Student</th>
              <th className="p-2">Type</th>
              <th className="p-2">Date(s)</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Attachment</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="border-b">
                <td className="p-2">
                  <b>{req.studentId?.name}</b>
                  <br />
                  <span className="text-xs text-gray-500">
                    {req.studentId?.className}
                  </span>
                </td>

                <td className="p-2 uppercase">{req.type}</td>

                <td className="p-2">
                  {req.type === "leave" &&
                    `${req.fromDate?.slice(0, 10)} → ${req.toDate?.slice(0, 10)}`}
                  {req.type === "od" && req.date?.slice(0, 10)}
                </td>

                <td className="p-2">{req.reason}</td>

                <td className="p-2">
                  {req.attachmentUrl ? (
                    <a
                      className="text-blue-600 underline"
                      href={`https://smart-face-attendance-mfkt.onrender.com${req.attachmentUrl}`}
                      target="_blank"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                  {req.status === "rejected" && (
                    <p className="text-xs text-red-600">
                      Reason: {req.rejectReason}
                    </p>
                  )}
                </td>

                <td className="p-2 space-x-2">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveRequest(req._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          setRejectModal({ open: true, id: req._id })
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-3">
            <h3 className="text-xl font-semibold">Reject Request</h3>

            <textarea
              placeholder="Enter reason for rejection"
              className="w-full border p-3 rounded"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal({ open: false, id: null })}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={rejectRequest}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



