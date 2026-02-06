import { useEffect, useState } from "react";

const API_BASE = "https://smart-face-attendance-mfkt.onrender.com/api/communication";

export default function FacultyCommunication({ facultyId }) {
  const [activeTab, setActiveTab] = useState("broadcast");

  // Broadcast
  const [title, setTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");

  // Individual
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [privateBody, setPrivateBody] = useState("");
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [conversation, setConversation] = useState([]);

  // Get student list
  useEffect(() => {
    fetch(`${API_BASE}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  }, []);

  // Get conversation if student selected
  useEffect(() => {
    if (!currentStudentId) return;
    fetch(
      `${API_BASE}/private/conversation?facultyId=${facultyId}&studentId=${currentStudentId}`
    )
      .then((res) => res.json())
      .then((data) => setConversation(data))
      .catch((err) => console.error(err));
  }, [currentStudentId, facultyId]);

  // Send broadcast
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId, title, body: broadcastBody }),
    });

    if (res.ok) {
      alert("Broadcast Sent!");
      setTitle("");
      setBroadcastBody("");
    } else {
      alert("Error sending broadcast");
    }
  };

  // Send private message
  const handlePrivateSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudentIds.length === 0) {
      alert("Select at least one student");
      return;
    }

    const res = await fetch(`${API_BASE}/private/faculty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId,
        studentIds: selectedStudentIds,
        body: privateBody,
      }),
    });

    if (res.ok) {
      alert("Private message sent!");
      setPrivateBody("");
      if (selectedStudentIds.length === 1) {
        setCurrentStudentId(selectedStudentIds[0]);
      }
    } else {
      alert("Error sending private message");
    }
  };

  const handleStudentSelect = (studentId) => {
    setCurrentStudentId(studentId);
    setSelectedStudentIds([studentId]);
  };

  const toggleStudentCheckbox = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-700">Faculty Communication</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "broadcast" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("broadcast")}
        >
          Broadcast
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "individual" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("individual")}
        >
          Individual Messages
        </button>
      </div>

      {/* Broadcast */}
      {activeTab === "broadcast" && (
        <div className="bg-white p-4 shadow rounded">
          <form onSubmit={handleBroadcastSubmit}>
            <input
              type="text"
              placeholder="Title"
              className="border p-2 rounded w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Message"
              className="border p-2 rounded w-full mt-2"
              rows={4}
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Individual */}
      {activeTab === "individual" && (
        <div className="grid grid-cols-3 gap-4">
          {/* Student list */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold">Students</h3>
            <ul className="max-h-64 overflow-y-auto">
              {students.map((student) => (
                <li
                  key={student._id}
                  className={`flex justify-between p-2 cursor-pointer ${
                    currentStudentId === student._id
                      ? "bg-blue-100"
                      : "bg-gray-50"
                  }`}
                  onClick={() => handleStudentSelect(student._id)}
                >
                  {student.name}
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student._id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleStudentCheckbox(student._id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Conversation */}
          <div className="col-span-2 bg-white p-4 shadow rounded flex flex-col">
            <h3 className="font-semibold mb-2">Conversation</h3>
            <div className="flex-1 overflow-y-auto border p-2 rounded">
              {conversation.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-2 ${
                    msg.from === facultyId ? "text-right" : "text-left"
                  }`}
                >
                  <div className="inline-block bg-gray-100 px-2 py-1 rounded">
                    {msg.body}
                  </div>
                </div>
              ))}
            </div>

            <form className="mt-2 flex" onSubmit={handlePrivateSubmit}>
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Type message"
                value={privateBody}
                onChange={(e) => setPrivateBody(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-3 py-2 rounded ml-2">
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


