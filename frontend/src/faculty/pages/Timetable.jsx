import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, AlertTriangle } from "lucide-react";

export default function FacultyTimetable() {
  const [classesToday, setClassesToday] = useState([]);
  const [freePeriods, setFreePeriods] = useState([]);
  const [fullWeekData, setFullWeekData] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState("");

  const token = localStorage.getItem("token");

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const PERIOD_TIMES = [
    { start: "09:00", end: "09:50" },
    { start: "09:50", end: "10:40" },
    { start: "10:40", end: "11:30" },
    { start: "11:30", end: "12:20" },
    { start: "13:00", end: "13:50" },
    { start: "13:50", end: "14:40" },
    { start: "14:40", end: "15:30" },
    { start: "15:30", end: "16:20" },
  ];

  // Detect today's weekday name
  const todayIndex = new Date().getDay() - 1;
  const todayName = DAYS[todayIndex];

  // ==== LIVE CLOCK ====
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const options = { weekday: "long", hour: "2-digit", minute: "2-digit", second: "2-digit" };
      setClock(now.toLocaleTimeString("en-US", options));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==== FETCH WEEKLY TIMETABLE ====
  const fetchData = () => {
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }

    fetch("https://smart-face-attendance-mfkt.onrender.com/api/faculty/timetable/weekly", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        const weekly = data.weekly || {};
        setFullWeekData(weekly);

        const todayData = weekly[todayName] || [];
        setClassesToday(todayData.filter(x => x !== null));
      })
      .catch(() => setError("Failed to load timetable"));

    fetch("https://smart-face-attendance-mfkt.onrender.com/api/faculty/free-periods", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setFreePeriods(data.freePeriods || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==== CURRENT PERIOD DETECTOR ====
  const getCurrentPeriod = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;

    return PERIOD_TIMES.findIndex(p => time >= p.start && time <= p.end);
  };

  const currentPeriodIndex = getCurrentPeriod();

  const markAbsent = (period) => {
    fetch("https://smart-face-attendance-mfkt.onrender.com/api/faculty/timetable/mark-absent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ period }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || "Marked absent");
        fetchData();
      });
  };

  const attendFreePeriod = (period) => {
    fetch("https://smart-face-attendance-mfkt.onrender.com/api/faculty/timetable/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ period }),
    })
      .then(res => res.json())
      .then((data) => {
        setMessage(data.message || "You claimed this free period");
        fetchData();
      });
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
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Weekly Timetable</h1>
              <p className="text-slate-300 text-sm mt-1">View and manage your class schedule</p>
            </div>
          </div>
          <div className="text-right font-semibold text-base px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            {clock}
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Timetable */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <th className="p-4 text-left font-semibold border-2 border-slate-400">Day</th>
                {PERIOD_TIMES.map((p, i) => (
                  <th key={i} className="p-4 text-center border-2 border-slate-400 border-l-0">
                    <div className="font-semibold text-sm">Period {i + 1}</div>
                    <div className="text-xs opacity-80 mt-1">{p.start}–{p.end}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {DAYS.map((day, idx) => {
                const isToday = day === todayName;

                return (
                  <tr
                    key={day}
                    className={`border-2 border-slate-300 border-t-0 ${
                      isToday ? "bg-indigo-50/50" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className={`p-4 font-semibold sticky left-0 z-10 border-r-2 border-slate-300 ${
                      isToday ? "text-indigo-700 bg-indigo-50/50" : "text-slate-800"
                    }`}>
                      {day}
                    </td>

                  {fullWeekData[day]?.map((p, i) => {
                    const freeInfo = freePeriods.find(fp => fp.period === i + 1);
                    const isFreeToday = isToday && !p && freeInfo;

                    const isCurrentPeriod = isToday && i === currentPeriodIndex;

                    return (
                      <td
                        key={i}
                        className={`p-3 text-center border-r-2 border-slate-300 relative transition-all
                          ${isCurrentPeriod ? "bg-blue-100 ring-2 ring-blue-400" : ""}
                          ${isFreeToday ? "bg-yellow-50" : ""}
                          hover:bg-slate-50`}
                      >

                        {/* FREE PERIOD (INSIDE TABLE) */}
                        {isFreeToday ? (
                          <div>
                            <div className="font-bold">FREE</div>
                            <div className="text-xs text-gray-700">{freeInfo.subject}</div>
                            <div className="text-xs text-gray-500">{freeInfo.start} - {freeInfo.end}</div>

                            <button
                              onClick={() => attendFreePeriod(freeInfo.period)}
                              className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                            >
                              Take
                            </button>
                          </div>
                        ) : p ? (
                          /* CLASS PERIOD */
                          <div className="flex flex-col items-center">
                            <div className="font-semibold text-indigo-700">{p.subject}</div>
                            <div className="text-xs text-gray-600">{p.start} - {p.end}</div>

                            {p.isSubstitution && (
                              <span className="mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Substitute
                              </span>
                            )}

                            {!p.teacherAbsent && (
                              <button
                                onClick={() => markAbsent(p.period)}
                                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium transition-colors"
                              >
                                Absent
                              </button>
                            )}

                            {p.teacherAbsent && (
                              <div className="mt-2 flex items-center gap-1 text-red-600 text-xs font-semibold">
                                <AlertTriangle size={14} /> Absent
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs italic">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Free Periods */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Available Free Periods</h2>
        </div>

        {freePeriods.length === 0 ? (
          <p className="text-slate-500 text-sm">No free periods available right now</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {freePeriods.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-xl border border-yellow-200"
              >
                <p className="font-semibold text-yellow-900 text-sm">Period {p.period} — {p.subject}</p>
                <p className="text-xs text-slate-600 mt-1">{p.start} - {p.end}</p>
                <button
                  onClick={() => attendFreePeriod(p.period)}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-medium transition-colors"
                >
                  Take This Period
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



