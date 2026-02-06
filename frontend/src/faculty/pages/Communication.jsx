import { useState, useEffect } from "react";

const API_BASE = "https://smart-face-attendance-mfkt.onrender.com/api/communication";

export default function Communication() {
  // ✔ Fetch correct faculty ID from localStorage
  const facultyId = localStorage.getItem("facultyId");

  // Broadcast States
  const [title, setTitle] = useState("");
  const [bMessage, setBMessage] = useState("");

  // Individual Message States
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [privateMessage, setPrivateMessage] = useState("");
  const [conversation, setConversation] = useState([]);

  // ====================== LOAD STUDENTS ======================
  useEffect(() => {
    fetch("https://smart-face-attendance-mfkt.onrender.com/api/student")
      .then((res) => res.json())
      .then((data) => setStudents(data.students))
      .catch(() => console.log("Error fetching students"));
  }, []);

  // ====================== SEND BROADCAST ======================
  const sendBroadcast = async () => {
    await fetch(`${API_BASE}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId,
        title,
        body: bMessage,
      }),
    });

    alert("Broadcast Sent ✔️");
    setTitle("");
    setBMessage("");
  };

  // ====================== OPEN CONVERSATION ======================
  const openConversation = async (studentId) => {
    setSelectedStudent(studentId);

    const res = await fetch(
      `${API_BASE}/private/conversation?facultyId=${facultyId}&studentId=${studentId}`
    );
    const data = await res.json();
    setConversation(data);
  };

  // ====================== SEND PRIVATE MESSAGE ======================
  const sendPrivateMessage = async () => {
    if (!selectedStudent) return alert("Select a student first");

    await fetch(`${API_BASE}/private/faculty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId,
        studentId: selectedStudent,
        body: privateMessage,
      }),
    });

    openConversation(selectedStudent);
    setPrivateMessage("");
  };

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Communication</h2>
              <p className="text-slate-300 text-sm mt-1">Broadcast messages and private conversations with students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Broadcast Message</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter broadcast title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="Message to all students"
              value={bMessage}
              onChange={(e) => setBMessage(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all duration-200"
            onClick={sendBroadcast}
          >
            Send Broadcast
          </button>
        </div>
      </div>

      {/* Private Chat Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <h2 className="font-bold text-lg mb-4 text-slate-800">Private Messages</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Student List */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Students</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map((std) => (
                <div
                  key={std._id}
                  onClick={() => openConversation(std._id)}
                  className={`cursor-pointer p-3 rounded-lg transition-all ${
                    selectedStudent === std._id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
                  }`}
                >
                  {std.name}
                </div>
              ))}
            </div>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-3">Conversation</h3>

            <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 overflow-y-auto mb-3 min-h-[300px]">
              {conversation.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Select a student to start conversation
                </div>
              ) : (
                <div className="space-y-3">
                  {conversation.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.from?._id === facultyId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className={`inline-block px-4 py-2 rounded-lg max-w-[70%] ${
                          msg.from?._id === facultyId
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {msg.body}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Type private message"
                value={privateMessage}
                onChange={(e) => setPrivateMessage(e.target.value)}
              />

              <button
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all duration-200"
                onClick={sendPrivateMessage}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


