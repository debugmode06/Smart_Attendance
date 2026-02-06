import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import {
    MapPin,
    QrCode,
    RefreshCcw,
    Play,
    Users,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    BookOpen
} from "lucide-react";
import "leaflet/dist/leaflet.css";

/* Fix leaflet marker asset paths */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function FacultyAttendance() {
    const navigate = useNavigate();

    // --- State ---
    const [qrCode, setQrCode] = useState("");
    const [expiresIn, setExpiresIn] = useState(30);
    const [className, setClassName] = useState("");
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Location ---
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState("idle");
    const locationWatcher = useRef(null);

    const token = localStorage.getItem("token");

    // --- Fetch Logic ---
    const fetchQR = async () => {
        try {
            const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/student/qr/current");
            const data = await res.json();
            setQrCode(data.qrCode);
            setExpiresIn(data.expiresIn);
        } catch (err) {
            console.error("QR Fetch Error", err);
        }
    };

    const fetchAttendanceData = async () => {
        try {
            const res = await fetch(
                "https://smart-face-attendance-mfkt.onrender.com/api/faculty/attendance/day",
                { headers: { Authorization: "Bearer " + token } }
            );
            const data = await res.json();
            setClassName(data.className || "");
            setPeriods(data.periods || []);
        } catch (err) {
            console.error("Attendance Data Error", err);
        } finally {
            setLoading(false);
        }
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("denied");
            return;
        }
        setLocationStatus("loading");
        locationWatcher.current = navigator.geolocation.watchPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
                setLocationStatus("success");
            },
            () => setLocationStatus("denied"),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    };

    useEffect(() => {
        fetchQR();
        fetchAttendanceData();

        const interval = setInterval(() => {
            fetchQR();
            fetchAttendanceData();
        }, 2000);

        return () => {
            clearInterval(interval);
            if (locationWatcher.current)
                navigator.geolocation.clearWatch(locationWatcher.current);
        };
    }, []);

    // --- Components ---

    const StatusBadge = ({ status }) => {
        const styles = {
            idle: "bg-slate-100 text-slate-500",
            loading: "bg-amber-100 text-amber-600",
            success: "bg-green-100 text-green-600",
            denied: "bg-red-100 text-red-600",
        };

        const labels = {
            idle: "Location Off",
            loading: "Locating...",
            success: "Live Active",
            denied: "Permission Denied",
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Dashboard</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Overview & Real-time Monitoring
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/faculty/live-attendance")}
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Start Live Session
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Map Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg text-slate-800">Live Location</h2>
                                        <p className="text-xs text-slate-500">Geofencing Monitor</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={locationStatus} />
                                    <button
                                        onClick={requestLocation}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Enable GPS
                                    </button>
                                </div>
                            </div>

                            <div className="h-[400px] w-full bg-slate-100 relative">
                                {locationStatus === "success" && location ? (
                                    <MapContainer
                                        center={[location.lat, location.lng]}
                                        zoom={17}
                                        key={`${location.lat}-${location.lng}`} // Force re-render on move
                                        style={{ height: "100%", width: "100%" }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Circle
                                            center={[location.lat, location.lng]}
                                            radius={30}
                                            pathOptions={{ color: "#4f46e5", fillColor: "#4f46e5", fillOpacity: 0.1 }}
                                        />
                                        <Marker position={[location.lat, location.lng]}>
                                            <Popup>
                                                <div className="text-center p-2">
                                                    <p className="font-bold text-slate-800">Your Location</p>
                                                    <p className="text-xs text-slate-500">Accuracy: {Math.round(location.accuracy)}m</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <MapPin className="w-16 h-16 mb-4 opacity-20" />
                                        <p>Map is inactive</p>
                                        <p className="text-sm">Click 'Enable GPS' to view location</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Static QR Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />

                            <div className="relative z-10 flex items-start gap-4">
                                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
                                    <QrCode className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Student Scan Code</h2>
                                    <p className="text-slate-500 text-sm mb-4 max-w-xs">
                                        Students can scan this code to quickly access the attendance portal.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg w-fit">
                                        <RefreshCcw className="w-3 h-3 animate-spin duration-[3000ms]" />
                                        Refreshing in {expiresIn}s
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 bg-white p-2 rounded-xl border-2 border-slate-100 shadow-sm">
                                <QRCodeCanvas value={qrCode || "loading"} size={140} />
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (1/3 width) - Sidebar */}
                    <div className="space-y-6">

                        {/* Class Summary */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="text-indigo-100 text-sm font-semibold mb-1">Teaching Class</h3>
                            <h2 className="text-3xl font-bold mb-6">{className || "Loading..."}</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                    <p className="text-xs text-indigo-100 mb-1">Total Periods</p>
                                    <p className="text-2xl font-bold">{periods.length}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                    <p className="text-xs text-indigo-100 mb-1">Status</p>
                                    <p className="text-lg font-bold flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Periods List */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-fit">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-500" />
                                    Today's Schedule
                                </h3>
                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-8 text-slate-400">Loading schedule...</div>
                                ) : periods.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-500">No classes scheduled today</p>
                                    </div>
                                ) : (
                                    periods.map((period, idx) => (
                                        <div key={idx} className="group bg-slate-50 hover:bg-white border boundary-slate-100 hover:shadow-md hover:border-indigo-100 transition-all rounded-2xl p-4 cursor-default">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{period.subject}</h4>
                                                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        Period {period.period} • {period.start} - {period.end}
                                                    </p>
                                                </div>
                                                <div className="bg-white shadow-sm border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-600">
                                                    P{period.period}
                                                </div>
                                            </div>

                                            {/* Stats Bar */}
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="flex-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex justify-between items-center">
                                                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Present</span>
                                                    <span className="font-bold">{period.presentCount}</span>
                                                </div>
                                                <div className="flex-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg flex justify-between items-center">
                                                    <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Absent</span>
                                                    <span className="font-bold">{period.absentCount}</span>
                                                </div>
                                            </div>

                                            {/* Expandable list logic could go here, but keeping it simple for dashboard view */}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
