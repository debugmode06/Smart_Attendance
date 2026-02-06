import { useState } from "react";
import { Megaphone, Send, Clock } from "lucide-react";

export default function AdminAnnouncements() {
  const [notices, setNotices] = useState([
    { id: 1, message: "Science Fair on 12th December", time: "2 hours ago" },
    { id: 2, message: "Holiday on 25th December", time: "1 day ago" },
  ]);
  const [newNotice, setNewNotice] = useState("");

  const handlePublish = () => {
    if (!newNotice.trim()) return;
    setNotices([
      { id: Date.now(), message: newNotice, time: "Just now" },
      ...notices,
    ]);
    setNewNotice("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Announcements</h2>
              <p className="text-slate-300 text-sm mt-1">Create and manage institute-wide announcements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Announcement */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Create New Announcement</h3>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows="4"
            placeholder="Type your announcement here..."
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
          ></textarea>
          <button
            onClick={handlePublish}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Publish Announcement
          </button>
        </div>
      </div>

      {/* Published Notices */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Published Announcements</h3>
        </div>
        <div className="p-6">
          {notices.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200"
                >
                  <p className="text-slate-800 font-medium mb-2">{n.message}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {n.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

