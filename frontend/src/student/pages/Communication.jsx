import { useEffect, useState } from "react";
import {
  Megaphone,
  UserCircle2,
  Search,
  Filter,
  ThumbsUp,
  Heart,
  Flame,
  Laugh,
  Send,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

const API_BASE = "https://smart-face-attendance-mfkt.onrender.com/api/communication";

export default function Communication() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user._id || user.id || null;

  const [activeTab, setActiveTab] = useState("broadcast");

  /** BROADCAST STATES */
  const [broadcasts, setBroadcasts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  /** PRIVATE STATES */
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [replyText, setReplyText] = useState("");

  /** REACTIONS STATE (UI only) */
  const [reactions, setReactions] = useState({});

  /** ---------------- LOAD BROADCASTS ---------------- */
  useEffect(() => {
    fetch(`${API_BASE}/broadcast/student`)
      .then((res) => res.json())
      .then((data) => setBroadcasts(data))
      .catch((err) => console.error("Broadcast error:", err));
  }, []);

  /** ---------------- LOAD PRIVATE MESSAGE FACULTY LIST ---------------- */
  useEffect(() => {
    fetch(`${API_BASE}/private/student/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        const facMap = {};
        data.forEach((msg) => {
          const other = msg.from._id === studentId ? msg.to : msg.from;
          if (other.role === "faculty") facMap[other._id] = other;
        });
        setFacultyList(Object.values(facMap));
      })
      .catch((err) => console.error("Private list error:", err));
  }, [studentId]);

  /** ---------------- OPEN CONVERSATION ---------------- */
  const openConversation = async (facultyId) => {
    setSelectedFaculty(facultyId);
    try {
      const res = await fetch(
        `${API_BASE}/private/conversation?facultyId=${facultyId}&studentId=${studentId}`
      );
      const data = await res.json();
      setConversation(data);
    } catch (err) {
      console.error("Conversation error:", err);
    }
  };

  /** ---------------- SEND REPLY ---------------- */
  const sendReply = async () => {
    if (!replyText.trim()) return;

    try {
      await fetch(`${API_BASE}/private/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          facultyId: selectedFaculty,
          body: replyText,
        }),
      });

      setReplyText("");
      openConversation(selectedFaculty);
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  /** ---------------- UI REACTION HANDLER ---------------- */
  const addReaction = (id, emoji) => {
    setReactions((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [emoji]: (prev[id]?.[emoji] || 0) + 1,
      },
    }));
  };

  /** FILTER BROADCASTS */
  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.body.toLowerCase().includes(search.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;

    return b.faculty?.name
      ?.toLowerCase()
      .includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Communication</h2>
              <p className="text-slate-300 text-sm mt-1">Stay connected with faculty and announcements</p>
            </div>
          </div>
          <div className="flex gap-3">
            {["broadcast", "private"].map((tab) => (
              <button
                key={tab}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "broadcast" ? "Announcements" : "Messages"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "broadcast" && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-6 space-y-6">

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center bg-white border-2 border-slate-300 px-4 py-2.5 rounded-lg w-full sm:w-1/2">
              <Search className="text-slate-500 mr-2" size={20} />
              <input
                placeholder="Search announcements..."
                className="bg-transparent w-full focus:outline-none text-slate-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-white border-2 border-slate-300 px-4 py-2.5 rounded-lg w-full sm:w-1/3">
              <Filter className="text-slate-500 mr-2" size={20} />
              <select
                className="bg-transparent w-full focus:outline-none text-slate-700"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Faculty</option>
                {broadcasts.map((b) => (
                  <option key={b._id} value={b.faculty?.name}>
                    {b.faculty?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBroadcasts.map((b) => (
              <div
                key={b._id}
                className="p-5 bg-white border-2 border-slate-300 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                {/* Faculty Header */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-white rounded-full shadow-inner flex items-center justify-center border">
                    <UserCircle2 size={28} className="text-blue-600" />
                  </div>

                  <div>
                    <p className="font-bold text-lg text-gray-800">{b.faculty?.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-blue-800 mb-1">{b.title}</h3>

                {/* Body */}
                <p className="text-gray-700 mb-3 leading-relaxed">{b.body}</p>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    📢 Announcement
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    #{b.faculty?.name?.split(" ")[0] || "Faculty"}
                  </span>
                </div>

                {/* Reactions */}
                <div className="flex gap-4">
                  {[
                    { icon: <ThumbsUp size={20} />, key: "like" },
                    { icon: <Heart size={20} />, key: "love" },
                    { icon: <Flame size={20} />, key: "fire" },
                    { icon: <Laugh size={20} />, key: "funny" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      onClick={() => addReaction(b._id, r.key)}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                    >
                      {r.icon}
                      <span className="text-sm">
                        {reactions[b._id]?.[r.key] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {filteredBroadcasts.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No announcements found.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* ====== PRIVATE CHAT PREMIUM UI ====== */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === "private" && (
        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-slate-300">
            <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
              <MessageSquare size={20} /> Faculty
            </h3>

            {facultyList.map((f) => (
              <button
                key={f._id}
                className={`w-full p-3 rounded-lg text-left mb-2 transition-all border-2 ${
                  selectedFaculty === f._id
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => openConversation(f._id)}
              >
                {f.name}
              </button>
            ))}

            {facultyList.length === 0 && (
              <p className="text-slate-400 text-sm">No messages yet.</p>
            )}
          </div>

          <div className="col-span-2 bg-white rounded-2xl p-4 shadow-lg border-2 border-slate-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              {selectedFaculty && (
                <button
                  className="p-2 bg-gray-100 rounded-full"
                  onClick={() => setSelectedFaculty(null)}
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h3 className="font-semibold text-xl text-blue-700">
                {selectedFaculty
                  ? facultyList.find((f) => f._id === selectedFaculty)?.name
                  : "Select a faculty"}
              </h3>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 rounded-xl p-4 overflow-y-auto shadow-inner">
              {conversation.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-3 flex ${
                    msg.from._id === studentId ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`px-4 py-2 rounded-2xl shadow text-sm max-w-xs ${
                      msg.from._id === studentId
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    {msg.body}
                  </span>
                </div>
              ))}

              {selectedFaculty && conversation.length === 0 && (
                <p className="text-center text-gray-400 text-sm mt-10">
                  No messages yet.
                </p>
              )}
            </div>

            {/* Reply Box */}
            {selectedFaculty && (
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 border p-3 rounded-xl"
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  onClick={sendReply}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


