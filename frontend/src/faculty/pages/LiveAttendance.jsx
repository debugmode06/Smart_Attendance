import React, { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Users,
    Play,
    CheckCircle,
    XCircle,
    Download,
    AlertCircle,
    Wifi,
    Camera,
    ChevronRight,
    Pause,
    RotateCcw
} from "lucide-react";
import { API_BASE } from "../../config/api";
import { useSafePoll } from "../../hooks/useSafePoll";
import { getCurrentSSID, isSSIDValid } from "../../utils/wifiUtils";

import { useNavigate } from "react-router-dom";

export default function LiveAttendanceNew() {
    const navigate = useNavigate();
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showStartForm, setShowStartForm] = useState(true); // Default to true to show form initially
    const [networkError, setNetworkError] = useState(null);
    const [currentSSID, setCurrentSSID] = useState("Scanning...");

    const [facultyProfile, setFacultyProfile] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        className: "",
        subject: "",
        period: "",
        startTime: "",
        endTime: "",
        roomId: "",
        timeLimit: 10,
    });

    const [extendMinutes, setExtendMinutes] = useState(5);

    const token = localStorage.getItem("token");

    // Wi-Fi Guard Logic
    const checkCurrentNetwork = async () => {
        const ssid = await getCurrentSSID();
        setCurrentSSID(ssid || "Not Connected");
    };

    useEffect(() => {
        checkCurrentNetwork();
        const interval = setInterval(checkCurrentNetwork, 10000);
        return () => clearInterval(interval);
    }, []);

    const isNetworkAuthorized = () => {
        if (!formData.roomId) return true;
        const selectedRoom = availableRooms.find(r => r.roomId === formData.roomId);
        if (!selectedRoom || !selectedRoom.ssid) return true;
        return isSSIDValid(currentSSID, selectedRoom.ssid);
    };

    // Safe Polling Logic
    const fetchActiveSessionTask = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/attendance-session/faculty/active`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 204 || res.status === 404) {
                return { session: null, stop: false };
            }

            if (res.ok) {
                const data = await res.json();
                return { session: data, stop: false };
            }

            throw new Error(`Server returned ${res.status}`);
        } catch (err) {
            setNetworkError("Server Unreachable. Retrying...");
            throw err;
        }
    }, [token]);

    const { data: pollData, restart: retryPolling } = useSafePoll(
        fetchActiveSessionTask,
        10000,
        {
            maxRetries: 2,
            onStop: (reason) => {
                if (reason !== "API endpoint missing") {
                    console.warn("Polling Stopped:", reason);
                    setNetworkError(`Connection Lost: ${reason}`);
                }
            }
        }
    );

    useEffect(() => {
        if (pollData) {
            setActiveSession(pollData.session);
            setNetworkError(null);
            // Only show form if explicitly no session
            if (!pollData.session) {
                setShowStartForm(true);
            } else {
                setShowStartForm(false);
            }
        }
    }, [pollData]);

    // Fetch faculty profile
    const fetchFacultyProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/faculty/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setFacultyProfile(data);
                if (data.subject) setFormData(prev => ({ ...prev, subject: data.subject }));
                if (data.className) setFormData(prev => ({ ...prev, className: data.className }));
            }
        } catch (error) { console.error("Profile error:", error); }
    };

    // Fetch available rooms
    const fetchRooms = async () => {
        try {
            const res = await fetch(`${API_BASE}/wifi/fingerprints`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 404) {
                setAvailableRooms([]);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setAvailableRooms(data || []);
            }
        } catch (e) {
            console.error("Error fetching rooms", e);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchFacultyProfile();
    }, []);

    const autoPopulateTime = () => {
        const now = new Date();
        const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, startTime, endTime: calculateEndTime(startTime, prev.timeLimit) }));
    };

    const calculateEndTime = (start, limitMinutes) => {
        if (!start || !limitMinutes) return "";
        const [hours, minutes] = start.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + parseInt(limitMinutes));
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    useEffect(() => {
        if (formData.startTime && formData.timeLimit) {
            setFormData(prev => ({ ...prev, endTime: calculateEndTime(formData.startTime, formData.timeLimit) }));
        }
    }, [formData.startTime, formData.timeLimit]);

    // Start session
    const handleStartSession = async (e) => {
        e.preventDefault();

        if (!isNetworkAuthorized()) {
            alert(`ACCESS DENIED: You are connected to "${currentSSID}". Please connect to the trained classroom Wi-Fi to start attendance.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/attendance-session/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                retryPolling();
            } else {
                alert(data.message || "Failed to start session");
            }
        } catch (error) {
            console.error("Start session error:", error);
            alert("Network Error: Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    // Extend time
    const handleExtendTime = async () => {
        try {
            const res = await fetch(`${API_BASE}/attendance-session/faculty/extend-time`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sessionId: activeSession._id,
                    additionalMinutes: parseInt(extendMinutes),
                }),
            });
            if (res.ok) retryPolling();
            else alert("Failed to extend time");
        } catch (error) { alert("Network Error"); }
    };

    // Confirm session
    const handleConfirmSession = async () => {
        if (!window.confirm("Confirm completion?")) return;
        try {
            const res = await fetch(`${API_BASE}/attendance-session/stop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ sessionId: activeSession._id }),
            });
            if (res.ok) retryPolling();
        } catch (error) { alert("Network Error"); }
    };

    // Download Excel
    const handleDownloadExcel = async () => {
        try {
            const res = await fetch(`${API_BASE}/attendance-session/faculty/excel/${activeSession._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Attendance_Report.xlsx`;
                a.click();
            }
        } catch (error) { alert("Download failed"); }
    };

    // Timer update
    useEffect(() => {
        if (activeSession?.status === "active") {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.floor((new Date(activeSession.expiresAt) - new Date()) / 1000));
                setTimeRemaining(remaining);
                if (remaining === 0) retryPolling();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [activeSession, retryPolling]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Network Error Banner */}
                {networkError && (
                    <div className="mb-4 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-lg flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6" />
                            <span className="font-semibold">{networkError}</span>
                        </div>
                        <button
                            onClick={() => retryPolling()}
                            className="bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Header Card - iPhone Style */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-slate-200/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Live Attendance
                            </h1>
                            <p className="text-slate-600 text-sm">Real-time WiFi + Face verification</p>
                        </div>

                        {/* WiFi Status Badge */}
                        <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 ${!isNetworkAuthorized() ? "bg-amber-50 border-2 border-amber-300" : "bg-green-50 border-2 border-green-300"}`}>
                            <Wifi className={`w-5 h-5 ${!isNetworkAuthorized() ? "text-amber-600" : "text-green-600"}`} />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-1">Current Network</p>
                                <p className={`text-sm font-bold ${!isNetworkAuthorized() ? "text-amber-700" : "text-green-700"}`}>
                                    {currentSSID}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Session Form - iPhone Style */}
                {showStartForm && !activeSession && (
                    <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-slate-200/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                                <Play className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Start New Session</h2>
                                <p className="text-xs text-slate-500">No active session found</p>
                            </div>
                        </div>

                        {!isNetworkAuthorized() && (
                            <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-4 rounded-2xl mb-6 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Network Mismatch</p>
                                    <p className="text-xs opacity-90 mt-1">
                                        Connect to the classroom WiFi to start attendance
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleStartSession} className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={autoPopulateTime}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    Auto-Fill Time
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Class Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.className}
                                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="e.g., CSE A"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Classroom</label>
                                    <select
                                        required
                                        value={formData.roomId}
                                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        disabled={availableRooms.length === 0}
                                    >
                                        {availableRooms.length === 0 ? (
                                            <option value="">No trained classrooms</option>
                                        ) : (
                                            <>
                                                <option value="">Select Room</option>
                                                {availableRooms.map((room) => (
                                                    <option key={room.roomId} value={room.roomId}>
                                                        {room.roomId} ({room.ssid || "No SSID"})
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Period</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Time Limit (min)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.timeLimit}
                                        onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isNetworkAuthorized()}
                                className={`w-full font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${!isNetworkAuthorized()
                                    ? "bg-slate-300 cursor-not-allowed text-slate-500"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                                    }`}
                            >
                                {!isNetworkAuthorized() ? <XCircle className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                {loading ? "Starting..." : !isNetworkAuthorized() ? "Connect to Classroom WiFi" : "Start Attendance Session"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Active Session Display - iPhone Style */}
                {activeSession && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Session Info Card */}
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl p-6 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold">Session Info</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Class:</strong> {activeSession.className}</p>
                                    <p><strong>Room:</strong> {activeSession.roomId}</p>
                                    <p><strong>Subject:</strong> {activeSession.subject}</p>
                                </div>
                            </div>

                            {/* Timer Card */}
                            <div className={`rounded-3xl shadow-xl p-6 text-white ${timeRemaining < 120 ? "bg-gradient-to-br from-red-500 to-pink-600" : "bg-gradient-to-br from-green-500 to-emerald-600"}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold">Time Left</h3>
                                </div>
                                <div className="text-5xl font-bold text-center my-4 font-mono">{formatTime(timeRemaining)}</div>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Statistics</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-600 font-semibold">Present</span>
                                        <span className="text-2xl font-bold text-green-600">{activeSession.presentCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-red-600 font-semibold">Absent</span>
                                        <span className="text-2xl font-bold text-red-600">{activeSession.absentCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        {activeSession.status !== "confirmed" && (
                            <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-slate-200/50">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-[250px] flex gap-3">
                                        <input
                                            type="number"
                                            value={extendMinutes}
                                            onChange={(e) => setExtendMinutes(e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="Minutes"
                                        />
                                        <button
                                            onClick={handleExtendTime}
                                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Extend
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleConfirmSession}
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Confirm Complete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Completed Session */}
                        {activeSession.status === "confirmed" && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-3xl p-6 mb-6 shadow-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4 text-green-800">
                                        <div className="p-3 bg-green-500 rounded-2xl">
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Session Completed</h3>
                                            <p className="text-sm">Attendance finalized successfully</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDownloadExcel}
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Report
                                    </button>
                                </div>

                                <button
                                    onClick={() => navigate("/faculty/attendance")}
                                    className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                    Back to Dashboard
                                </button>
                            </div>
                        )}

                        {/* Student List - iPhone Style */}
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200/50">
                            <h3 className="text-xl font-bold mb-6 text-slate-900">Student Status</h3>
                            <div className="space-y-3">
                                {(activeSession.studentsMarked || []).map((s) => (
                                    <div
                                        key={s.studentId}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:shadow-md transition-all"
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900">{s.studentName}</p>
                                            <p className="text-sm text-slate-600">{s.registerNo}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${(s.status || "absent") === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {(s.status || "absent").toUpperCase()}
                                            </span>
                                            <div className="flex gap-2">
                                                {s.wifiVerified ? (
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Wifi className="w-4 h-4 text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-slate-200 rounded-lg">
                                                        <Wifi className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                )}
                                                {s.faceVerified ? (
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Camera className="w-4 h-4 text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-slate-200 rounded-lg">
                                                        <Camera className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
