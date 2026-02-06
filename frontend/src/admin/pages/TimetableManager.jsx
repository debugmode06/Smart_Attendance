import { useEffect, useState } from "react";
import { Copy, AlertTriangle, Calendar, Clock, Users, Save, Download } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_PERIOD_TIMES = [
  { period: 1, start: "09:00", end: "09:50" },
  { period: 2, start: "09:50", end: "10:40" },
  { period: 3, start: "10:50", end: "11:40" },
  { period: 4, start: "11:40", end: "12:30" },
  { period: 5, start: "13:30", end: "14:20" },
  { period: 6, start: "14:20", end: "15:10" },
];

export default function TimetableManager() {
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [periodTimes, setPeriodTimes] = useState([...DEFAULT_PERIOD_TIMES]);
  const [grid, setGrid] = useState([]);

  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");

  useEffect(() => {
    loadClasses();
    loadMeta();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/classes", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) setClasses(data.classes || []);
    } catch {
      console.log("Load classes error");
    }
  };

  const loadMeta = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/timetable/meta", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) {
        setFaculty(data.faculty || []);
        setSubjects(data.subjects || []);
      }
    } catch {
      console.log("Load meta error");
    }
  };

  const buildEmptyGrid = () =>
    DAYS.map((day) => ({
      day,
      periods: DEFAULT_PERIOD_TIMES.map(() => ({
        subject: "",
        faculty: "",
        isFreePeriod: true,
        teacherAbsent: false,
        substituteFaculty: "",
      })),
    }));

  const loadTimetable = async () => {
    setConflicts([]);

    if (!selectedClass) {
      alert("Select a class first");
      return;
    }

    try {
      const res = await fetch(
        `https://smart-face-attendance-mfkt.onrender.com/api/admin/timetable/${selectedClass}`,
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = await res.json();

      if (!res.ok) {
        setGrid(buildEmptyGrid());
        setPeriodTimes([...DEFAULT_PERIOD_TIMES]);
        return;
      }

      if (data.days && data.days.length > 0) {
        const firstDay = data.days[0];
        if (firstDay.periods?.length === DEFAULT_PERIOD_TIMES.length) {
          setPeriodTimes(
            firstDay.periods.map((p, idx) => ({
              period: idx + 1,
              start: p.start || DEFAULT_PERIOD_TIMES[idx].start,
              end: p.end || DEFAULT_PERIOD_TIMES[idx].end,
            }))
          );
        }

        const newGrid = DAYS.map((day) => {
          const dayDoc = data.days.find((d) => d.day === day);
          if (!dayDoc)
            return {
              day,
              periods: DEFAULT_PERIOD_TIMES.map(() => ({
                subject: "",
                faculty: "",
                isFreePeriod: true,
                teacherAbsent: false,
                substituteFaculty: "",
              })),
            };

          return {
            day,
            periods: dayDoc.periods.map((p) => ({
              subject: p.subject || "",
              faculty: p.faculty ? p.faculty.toString() : "",
              isFreePeriod: p.isFreePeriod ?? !p.subject,
              teacherAbsent: p.teacherAbsent || false,
              substituteFaculty: p.substituteFaculty
                ? p.substituteFaculty.toString()
                : "",
            })),
          };
        });

        setGrid(newGrid);
      } else {
        setGrid(buildEmptyGrid());
      }
    } catch (err) {
      console.error("Timetable load error:", err);
      setGrid(buildEmptyGrid());
    }
  };

  const handleHeaderTimeChange = (index, field, value) => {
    const updated = [...periodTimes];
    updated[index][field] = value;
    setPeriodTimes(updated);
  };

  const updateCell = (dayIdx, periodIdx, changes) => {
    setGrid((prev) => {
      const copy = [...prev];
      const row = { ...copy[dayIdx] };
      const periods = [...row.periods];
      periods[periodIdx] = { ...periods[periodIdx], ...changes };

      if (changes.isFreePeriod) {
        periods[periodIdx].subject = "";
        periods[periodIdx].faculty = "";
        periods[periodIdx].teacherAbsent = false;
        periods[periodIdx].substituteFaculty = "";
      }

      row.periods = periods;
      copy[dayIdx] = row;
      return copy;
    });
  };

  const saveTimetable = async () => {
    if (!selectedClass) {
      alert("Select a class");
      return;
    }

    setSaving(true);
    setConflicts([]);

    const payload = {
      className: selectedClass,
      days: grid.map((row, dayIdx) => ({
        day: row.day,
        periods: row.periods.map((cell, pIdx) => ({
          period: periodTimes[pIdx].period,
          start: periodTimes[pIdx].start,
          end: periodTimes[pIdx].end,
          subject: cell.subject,
          faculty: cell.faculty || null,
          isFreePeriod: cell.isFreePeriod,
          teacherAbsent: cell.teacherAbsent,
          substituteFaculty: cell.substituteFaculty || null,
        })),
      })),
    };

    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/timetable/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.conflicts) {
          setConflicts(data.conflicts);
        } else {
          alert(data.message || "Failed to save timetable");
        }
        return;
      }

      alert("Timetable saved successfully!");
    } catch (err) {
      console.error("Save timetable error:", err);
      alert("Error saving timetable");
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (!fromClass || !toClass) {
      alert("Select both source and target class");
      return;
    }
    if (fromClass === toClass) {
      alert("Source and target cannot be same");
      return;
    }

    try {
      const res = await fetch(
        "https://smart-face-attendance-mfkt.onrender.com/api/admin/timetable/duplicate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ fromClassName: fromClass, toClassName: toClass }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to duplicate timetable");
        return;
      }

      alert("Timetable duplicated!");
      if (selectedClass === toClass) loadTimetable();
    } catch (err) {
      console.error("Duplicate timetable error:", err);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Timetable Management</h2>
            <p className="text-blue-100 text-sm mt-1">Create and manage class schedules efficiently</p>
          </div>
        </div>
      </div>

      {/* TOP BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Select + Load */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/50 space-y-4 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-base font-bold text-gray-800">
              Select Class & Load
          </p>
          </div>

          <select
            className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-sm bg-gradient-to-br from-slate-50 to-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>

          <button
            onClick={loadTimetable}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Load Timetable
          </button>
        </div>

        {/* Duplicate */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/50 space-y-4 hover:shadow-2xl transition-all duration-300 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Copy className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-base font-bold text-gray-800">
            Duplicate Timetable
          </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="flex-1 min-w-[140px] border-2 border-slate-300 rounded-xl px-4 py-3 text-sm bg-gradient-to-br from-slate-50 to-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
              value={fromClass}
              onChange={(e) => setFromClass(e.target.value)}
            >
              <option value="">From Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>

            <div className="p-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg">
              <span className="text-white font-bold text-lg">→</span>
            </div>

            <select
              className="flex-1 min-w-[140px] border-2 border-slate-300 rounded-xl px-4 py-3 text-sm bg-gradient-to-br from-slate-50 to-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
              value={toClass}
              onChange={(e) => setToClass(e.target.value)}
            >
              <option value="">To Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>

            <button
              onClick={duplicate}
              className="px-6 py-3 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
          </div>

          <p className="text-xs text-gray-500 bg-slate-50 p-2 rounded-lg">
            💡 Useful when multiple sections share the same timetable.
          </p>
        </div>
      </div>

      {/* CONFLICTS */}
      {conflicts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-5 flex gap-4 shadow-xl animate-pulse">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-sm text-red-900 space-y-2 flex-1">
            <p className="font-bold text-base">⚠️ Conflicts Detected</p>
            <ul className="list-disc pl-5 space-y-1">
              {conflicts.map((c, idx) => (
                <li key={idx} className="font-medium">
                  <span className="font-bold">{c.day}</span>, Period <span className="font-bold">{c.period}</span> • Faculty <span className="font-bold">{c.faculty}</span> also in{" "}
                  <span className="text-red-700">{c.otherClasses.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TIMETABLE GRID */}
      {grid.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-800">Class Schedule</h3>
            </div>
            {selectedClass && (
              <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <span className="text-sm font-semibold text-blue-800">{selectedClass}</span>
              </div>
            )}
          </div>
          
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700">
                  <th className="border-r-2 border-slate-500 p-4 text-left font-bold text-white sticky left-0 bg-gradient-to-r from-slate-700 to-slate-600 z-20 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Day / Time</span>
                    </div>
                </th>

                {periodTimes.map((p, idx) => (
                  <th
                    key={p.period}
                      className="border-r-2 border-slate-500 p-2 text-center w-[140px] font-bold text-white bg-gradient-to-b from-slate-600 to-slate-700"
                  >
                      <div className="mb-1">
                        <span className="inline-block px-2 py-0.5 bg-white/20 rounded-lg font-extrabold text-xs backdrop-blur-sm">
                          P{p.period}
                        </span>
                      </div>

                      <div className="flex gap-1 justify-center items-center mt-1">
                      <input
                        type="time"
                          className="border border-slate-400 rounded px-1 py-0.5 text-[10px] bg-white/90 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium text-gray-700 w-[60px]"
                        value={p.start}
                        onChange={(e) =>
                          handleHeaderTimeChange(idx, "start", e.target.value)
                        }
                      />

                        <span className="text-white font-bold text-[10px]">–</span>

                      <input
                        type="time"
                          className="border border-slate-400 rounded px-1 py-0.5 text-[10px] bg-white/90 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium text-gray-700 w-[60px]"
                        value={p.end}
                        onChange={(e) =>
                          handleHeaderTimeChange(idx, "end", e.target.value)
                        }
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {grid.map((row, dayIdx) => (
                <tr
                  key={row.day}
                    className={`border-b-4 transition-all duration-200 ${
                      dayIdx % 2 === 0
                        ? "bg-gradient-to-r from-blue-50/50 to-white border-blue-200"
                        : "bg-white border-slate-300"
                    } hover:bg-blue-50/70`}
                >
                    <td className={`border-r-4 p-3 font-bold text-gray-800 sticky left-0 z-10 shadow-lg w-[100px] ${
                      dayIdx % 2 === 0
                        ? "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300"
                        : "bg-gradient-to-r from-slate-100 to-white border-slate-400"
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${dayIdx % 2 === 0 ? "bg-blue-600" : "bg-slate-500"}`}></div>
                        <span className="text-sm">{row.day}</span>
                      </div>
                  </td>

                  {row.periods.map((cell, periodIdx) => {
                    const isFree = cell.isFreePeriod;
                    const isAbsent = cell.teacherAbsent;

                    return (
                      <td
                        key={periodIdx}
                          className={`border-r-2 border-slate-200 p-2 align-top transition-all duration-200 ${
                          isFree
                              ? "bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100"
                            : isAbsent
                              ? "bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100"
                              : "bg-white hover:bg-blue-50/30"
                        }`}
                      >
                          <div className="space-y-1.5">
                          {/* Subject */}
                          <select
                              className={`w-full border rounded-lg px-1.5 py-1 text-[10px] font-medium transition-all ${
                                cell.isFreePeriod
                                  ? "border-emerald-300 bg-emerald-100/50 text-gray-500"
                                  : "border-blue-300 bg-white hover:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-500 text-gray-700"
                              }`}
                            disabled={cell.isFreePeriod}
                            value={cell.subject}
                            onChange={(e) =>
                              updateCell(dayIdx, periodIdx, {
                                subject: e.target.value,
                                isFreePeriod: e.target.value === "",
                              })
                            }
                          >
                            <option value="">Free Period</option>
                            {subjects.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          {/* Faculty */}
                          <select
                              className={`w-full border rounded-lg px-1.5 py-1 text-[10px] font-medium transition-all ${
                                cell.isFreePeriod
                                  ? "border-emerald-300 bg-emerald-100/50 text-gray-500"
                                  : "border-indigo-300 bg-white hover:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-500 text-gray-700"
                              }`}
                            disabled={cell.isFreePeriod}
                              value={cell.faculty}
                            onChange={(e) =>
                              updateCell(dayIdx, periodIdx, {
                                faculty: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Faculty</option>
                            {faculty.map((f) => (
                              <option key={f._id} value={f._id}>
                                {f.name} ({f.subject})
                              </option>
                            ))}
                          </select>

                          {/* Toggles */}
                            <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-slate-200">
                              <label className="flex items-center gap-1 text-[9px] font-semibold cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={cell.isFreePeriod}
                                onChange={(e) =>
                                  updateCell(dayIdx, periodIdx, {
                                    isFreePeriod: e.target.checked,
                                  })
                                }
                                  className="w-3 h-3 rounded border border-emerald-400 text-emerald-600 focus:ring-1 focus:ring-emerald-300"
                              />
                                <span className={`${cell.isFreePeriod ? 'text-emerald-700' : 'text-gray-600'} group-hover:text-emerald-700`}>
                              Free
                                </span>
                            </label>

                              <label className={`flex items-center gap-1 text-[9px] font-semibold ${cell.isFreePeriod ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}>
                              <input
                                type="checkbox"
                                disabled={cell.isFreePeriod}
                                checked={cell.teacherAbsent}
                                onChange={(e) =>
                                  updateCell(dayIdx, periodIdx, {
                                    teacherAbsent: e.target.checked,
                                    substituteFaculty: e.target.checked
                                      ? cell.substituteFaculty
                                      : "",
                                  })
                                }
                                  className="w-3 h-3 rounded border border-amber-400 text-amber-600 focus:ring-1 focus:ring-amber-300 disabled:opacity-50"
                              />
                                <span className={`${cell.teacherAbsent ? 'text-amber-700' : 'text-gray-600'} ${!cell.isFreePeriod && 'group-hover:text-amber-700'}`}>
                              Absent
                                </span>
                            </label>
                          </div>

                          {/* Substitute */}
                          {!cell.isFreePeriod && cell.teacherAbsent && (
                            <select
                                className="w-full border border-amber-300 rounded-lg px-1.5 py-1 text-[10px] bg-white hover:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:border-amber-500 font-medium text-gray-700 mt-1"
                              value={cell.substituteFaculty}
                              onChange={(e) =>
                                updateCell(dayIdx, periodIdx, {
                                  substituteFaculty: e.target.value,
                                })
                              }
                            >
                              <option value="">Substitute Faculty</option>
                              {faculty.map((f) => (
                                <option key={f._id} value={f._id}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          )}

                            <div className={`text-[9px] font-medium mt-1 px-1.5 py-0.5 rounded ${
                              isFree
                                ? "bg-emerald-100 text-emerald-700"
                                : isAbsent
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                            {isFree
                                ? "🆓 Free"
                              : isAbsent
                                ? "⚠️ Substitute"
                                : "✅ Regular"}
                            </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={saveTimetable}
              disabled={saving}
              className={`px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              }`}
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Timetable"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


