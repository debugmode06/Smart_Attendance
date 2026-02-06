// src/student/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceRegistrationModal from "../../components/FaceRegistrationModal";

import {
  Activity,
  BarChart2,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Sparkles,
  Star,
  Target,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart as RLineChart,
  Line,
  PieChart as RPieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const ALL_INTERESTS = [
    "Web Development",
    "Ethical Hacking",
    "Cybersecurity",
    "AI & Machine Learning",
    "Data Science",
    "App Development",
    "Cloud Computing",
    "Computer Networks",
    "Software Engineering",
    "Competitive Programming",
  ];

  // ───────────────────── SAVE INTERESTS ─────────────────────
  const saveInterests = async () => {
    if (selectedInterests.length === 0) {
      alert("Please select at least one interest");
      return;
    }

    try {
      setSavingInterests(true);
      const res = await fetch(
        "https://smart-face-attendance-mfkt.onrender.com/api/student/save-interests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ interests: selectedInterests }),
        }
      );

      if (!res.ok) {
        alert("Failed to save interests");
        return;
      }

      setUser((prev) =>
        prev ? { ...prev, interests: selectedInterests } : prev
      );
      setShowInterestForm(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving interests");
    } finally {
      setSavingInterests(false);
    }
  };

  // ───────────────────── LOAD DATA ─────────────────────
  useEffect(() => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [dashRes, aiRes] = await Promise.all([
          fetch("https://smart-face-attendance-mfkt.onrender.com/api/student/dashboard", {
            headers: { Authorization: "Bearer " + token },
          }),
          fetch("https://smart-face-attendance-mfkt.onrender.com/api/student/ai-suggestions", {
            headers: { Authorization: "Bearer " + token },
          }),
        ]);

        const dashData = await dashRes.json();
        const aiData = await aiRes.json();

        if (!dashRes.ok) {
          setError(dashData.message || "Failed to load dashboard");
        } else {
          setUser(dashData.user);
          setStats(dashData.stats);

          // Face registration popup
          if (
            dashData.user?.role === "student" &&
            !dashData.user.faceRegistered
          ) {
            setShowRegisterModal(true);
          }

          // Interests
          if (!dashData.user?.interests?.length) {
            setShowInterestForm(true);
          } else {
            setSelectedInterests(dashData.user.interests);
          }
        }

        if (aiRes.ok && aiData.suggestions) {
          setSuggestions(aiData.suggestions);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Something went wrong loading dashboard");
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────────────────── DERIVED METRICS & FALLBACKS ─────────────────────
  const attendance = stats?.attendancePercent ?? 0;
  const assignmentsPending = stats?.assignmentsPending ?? 0;
  const assessmentCount = stats?.assessmentCount ?? 0;

  const attendanceStatus =
    attendance >= 90 ? "Excellent" : attendance >= 75 ? "Safe" : "At Risk";

  const subjectsRaw = stats?.subjects || [];
  const subjects =
    subjectsRaw.length > 0
      ? subjectsRaw
      : [
          {
            subject: "DSA",
            mark: 82,
            highest: 96,
            lowest: 38,
            avg: 78,
            cia: 77,
          },
          {
            subject: "OS",
            mark: 76,
            highest: 91,
            lowest: 42,
            avg: 74,
            cia: 72,
          },
          {
            subject: "DBMS",
            mark: 79,
            highest: 94,
            lowest: 40,
            avg: 76,
            cia: 75,
          },
          {
            subject: "CN",
            mark: 74,
            highest: 89,
            lowest: 36,
            avg: 71,
            cia: 70,
          },
          {
            subject: "Maths",
            mark: 88,
            highest: 99,
            lowest: 45,
            avg: 83,
            cia: 84,
          },
        ];

  const avgMark =
    stats?.avgMark ??
    (subjects.length
      ? subjects.reduce((sum, s) => sum + (s.mark || 0), 0) / subjects.length
      : 0);

  const avgCgpa = stats?.avgCgpa ?? user?.cgpa ?? 8.1; // fallback demo

  const attendanceSafe = Math.min(Math.max(Number(attendance) || 0, 0), 100);

  // Grouped marks data: highest / lowest / avg / your mark
  const marksBreakdownData = subjects.map((s) => {
    const your = s.mark ?? 0;
    const average = s.avg ?? s.average ?? Math.max(0, your - 5);
    const highest = s.highest ?? Math.min(100, your + 10);
    const lowest = s.lowest ?? Math.max(30, your - 20);
    return {
      subjectName: s.subject,
      highest,
      lowest,
      average,
      yourMark: your,
    };
  });

  // Trend data (CIA or derived)
  const ciaTrendData = subjects.map((s, i) => ({
    subjectName: s.subject,
    score: s.cia ?? (s.mark ?? 0) - i * 1.4,
  }));

  // Radar data
  const radarData = subjects.map((s) => ({
    subjectName: s.subject,
    strength: Math.round(((s.mark ?? 0) / 100) * 10), // 0–10 scale
  }));

  // Performance categories
  const categoryCounts = subjects.reduce(
    (acc, s) => {
      const m = s.mark ?? 0;
      if (m >= 85) acc.high += 1;
      else if (m >= 70) acc.medium += 1;
      else acc.low += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const performancePieData = [
    { name: "Strong (≥85)", value: categoryCounts.high || 1 },
    { name: "Stable (70–84)", value: categoryCounts.medium || 1 },
    { name: "Needs Focus (<70)", value: categoryCounts.low || 1 },
  ];

  const PIE_COLORS = ["#22c55e", "#3b82f6", "#f97316"];

  // ───────────────────── LOADING & ERROR STATES ─────────────────────
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex items-center gap-4 border border-slate-200">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <div>
            <p className="font-semibold text-gray-800">
              Loading your dashboard…
            </p>
            <p className="text-xs text-gray-500">
              Fetching attendance, marks, XP and smart suggestions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center border border-red-100">
          <p className="font-semibold text-red-600 mb-1">
            Unable to load dashboard
          </p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────── MAIN UI ─────────────────────
  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name || "Student"}</h1>
              <p className="text-slate-300 text-sm mt-1">Your academic overview and performance metrics</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
              {user?.department || user?.deptName || "CSE"}
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
              {user?.className || user?.classSection || "CSE A"}
            </span>
            {user?.registerNo && (
              <span className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                Reg: {user.registerNo}
              </span>
            )}
          </div>
        </div>
      </div>

        {/* QUICK NAV + ANNOUNCEMENTS (RIGHT BELOW HEADER) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Navigation – spans 2 cols on large */}
          <div className="lg:col-span-2">
            <Card title="Quick Navigation">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <QuickNavButton
                  icon={CalendarDays}
                  label="Timetable"
                  color="indigo"
                  onClick={() => navigate("/student/schedule")}
                />
                <QuickNavButton
                  icon={ListTodo}
                  label="Assignments"
                  color="violet"
                  onClick={() => navigate("/student/assignments")}
                />
                <QuickNavButton
                  icon={BarChart2}
                  label="Attendance"
                  color="emerald"
                  onClick={() => navigate("/student/attendance")}
                />
                <QuickNavButton
                  icon={Clock}
                  label="Leave / OD"
                  color="amber"
                  onClick={() => navigate("/student/leave")}
                />
              </div>
            </Card>
          </div>

          {/* Announcements */}
          <div>
            <Card title="Important Announcements">
              {!stats?.announcements?.length ? (
                <p className="text-xs text-gray-500">
                  No new announcements from faculty/admin.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto mt-1 pr-1">
                  {stats.announcements.map((a, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[11px] flex gap-2"
                    >
                      <Bell className="w-3.5 h-3.5 text-rose-500 mt-0.5" />
                      <p className="text-slate-800 leading-snug">• {a}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* TOP STATS – Attendance / Avg Mark / Avg CGPA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Activity}
            label="Attendance"
            value={`${attendanceSafe.toFixed(1)}%`}
            chip={attendanceStatus}
          />
          <StatCard
            icon={BookOpen}
            label="Average Marks"
            value={avgMark.toFixed(2)}
            chip="Across all subjects"
          />
          <StatCard
            icon={CheckCircle2}
            label="Average CGPA"
            value={Number(avgCgpa || 0).toFixed(2)}
            chip="Overall performance"
          />
        </div>

        {/* MAIN ANALYTICS ROW – Grouped Bar / Trend / Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* MARKS BREAKDOWN – H/L/AVG/YOUR */}
          <Card title="Marks Breakdown by Subject">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={marksBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="subjectName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Bar
                    dataKey="highest"
                    stackId={null}
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="average"
                    stackId={null}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="lowest"
                    stackId={null}
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="yourMark"
                    stackId={null}
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </RBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-500">
              <LegendDot color="#22c55e" label="Highest" />
              <LegendDot color="#3b82f6" label="Average" />
              <LegendDot color="#f97316" label="Lowest" />
              <LegendDot color="#a855f7" label="Your Mark" />
            </div>
          </Card>

          {/* CIA / PERFORMANCE TREND */}
          <Card title="Performance Trend (CIA / Internal)">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={ciaTrendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="subjectName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#38bdf8"
                    strokeWidth={2.2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* RADAR – SUBJECT STRENGTH */}
          <Card title="Subject Strength Radar">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="subjectName"
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 10]}
                    tick={{ fontSize: 9, fill: "#9ca3af" }}
                  />
                  <Radar
                    name="Strength"
                    dataKey="strength"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    isAnimationActive
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* SECOND ANALYTICS ROW – XP / PERFORMANCE PIE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* XP GAUGE */}
          <Card title="Gamified XP Progress">
            <div className="flex flex-col h-56 justify-between">
              <XPProgress />
              <p className="text-[11px] text-slate-500">
                Earn XP via AI mini-games and streak-based practice. Higher XP
                unlocks badges and rewards.
              </p>
            </div>
          </Card>

          {/* PERFORMANCE CATEGORY PIE */}
          <Card title="Subject Performance Distribution">
            <div className="flex h-56">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie
                      data={performancePieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={70}
                      paddingAngle={2}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    >
                      {performancePieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                      itemStyle={{ color: "#e5e7eb" }}
                    />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-2">
                {performancePieData.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-slate-700">{p.name}</span>
                    </div>
                    <span className="text-slate-500">{p.value} subj</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* SMART SUGGESTIONS */}
        <Card title="Smart Suggestions (AI-based)">
          {!suggestions || suggestions.length === 0 ? (
            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              No special suggestions right now. You are on track.
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestions.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-xs text-gray-800 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-500">
                      Period {s.period} • {s.start} – {s.end}
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-cyan-200 text-[10px] text-cyan-700">
                      <Target className="w-3 h-3 inline mr-1" />
                      Focus
                    </span>
                  </div>
                  <p className="font-semibold text-[13px]">{s.label}</p>
                  <p className="text-[11px] text-emerald-700">{s.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* INTERESTS */}
        <Card title="Your Interests">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[11px] text-slate-500">
              Used by AI to personalize suggestions and content.
            </p>
            <button
              onClick={() => setShowInterestForm(true)}
              className="text-[10px] text-blue-600 underline"
            >
              Edit
            </button>
          </div>

          {!user?.interests?.length ? (
            <p className="text-xs text-gray-500">No interests selected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((int) => (
                <span
                  key={int}
                  className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[11px] text-sky-700 flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                  {int}
                </span>
              ))}
            </div>
          )}
        </Card>

      {/* INTEREST MODAL */}
      {showInterestForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative border border-slate-200">
            <button
              onClick={() => setShowInterestForm(false)}
              className="absolute right-3 top-3"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>

            <h2 className="text-xl font-bold text-blue-700">Select Interests</h2>
            <p className="text-xs text-gray-500">
              This helps us tailor smart suggestions and learning paths for you.
            </p>

            <div className="flex flex-wrap gap-2 mt-4 max-h-52 overflow-y-auto p-2 border rounded-xl">
              {ALL_INTERESTS.map((int) => {
                const selected = selectedInterests.includes(int);
                return (
                  <button
                    key={int}
                    onClick={() =>
                      setSelectedInterests((prev) =>
                        prev.includes(int)
                          ? prev.filter((x) => x !== int)
                          : [...prev, int]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {selected && (
                      <Star className="w-3 h-3 inline fill-yellow-300 text-yellow-300 mr-1" />
                    )}
                    {int}
                  </button>
                );
              })}
            </div>

            <button
              onClick={saveInterests}
              disabled={savingInterests}
              className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {savingInterests ? "Saving…" : "Save Interests"}
            </button>
          </div>
        </div>
      )}

      {/* FACE REGISTRATION MODAL */}
      {showRegisterModal && (
        <FaceRegistrationModal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────  SMALL COMPONENTS  ───────────────────────── */

function StatCard({ icon: Icon, label, value, chip }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 p-5 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-bold text-slate-800">{value}</span>
      </div>
      <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
      <p className="text-xs text-slate-500">{chip}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-white px-5 sm:px-6 pt-4 pb-3 border-b-2 border-slate-300">
        <p className="text-sm font-bold text-slate-800">{title}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function QuickNavButton({ icon: Icon, label, color, onClick }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200",
    violet: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  };

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 ${colorMap[color]} flex flex-col items-center gap-2 transition-all duration-200`}
    >
      <Icon className="w-5 h-5" />
      <p className="font-semibold text-xs">{label}</p>
    </button>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}

/* ─────────────────────────  XP PROGRESS  ───────────────────────── */

function XPProgress() {
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  const rewardLadder = [
    { xp: 100, label: "Bronze Badge" },
    { xp: 200, label: "Silver Badge" },
    { xp: 300, label: "Gold Badge" },
    { xp: 500, label: "Internship Opportunity" },
  ];

  const getRewardProgress = () => {
    const next = rewardLadder.find((r) => xp < r.xp);
    if (!next) {
      return {
        text: "🎉 All rewards unlocked including Internship!",
        percent: 100,
      };
    }
    return {
      percent: Math.min(100, (xp / next.xp) * 100),
      text: `You need ${next.xp - xp} XP more to unlock ${next.label}`,
    };
  };

  const reward = getRewardProgress();

  useEffect(() => {
    async function loadXP() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/student/xp", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setXp(data.totalXP || 0);
      } catch (err) {
        console.error("XP Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadXP();
  }, []);

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-3 text-gray-500">
        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent animate-spin rounded-full" />
        <span className="text-xs">Loading XP…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full bg-purple-100" />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#a855f7 ${
                reward.percent * 3.6
              }deg, #e5e7eb 0deg)`,
            }}
          />
          <div className="relative h-10 w-10 rounded-full bg-white flex items-center justify-center top-3 left-3 shadow-sm">
            <span className="text-xs font-semibold text-purple-700">
              {xp} XP
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-purple-700">
            Leveling up your learning
          </p>
          <p className="text-[11px] text-slate-500 max-w-[180px]">
            Keep playing mini-games and completing tasks to unlock more rewards.
          </p>
        </div>
      </div>

      <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 transition-all duration-500"
          style={{ width: `${reward.percent}%` }}
        />
      </div>

      <p className="text-[11px] text-purple-700">{reward.text}</p>
    </div>
  );
}


