import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FaceScanModal from "../../components/FaceScanModal";
import { Check, Clock, Wifi, MapPin, ScanFace, QrCode as QrIcon, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";

import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔹 Leaflet marker default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔹 Campus config (Option B – your college)
const CAMPUS_CENTER = { lat: 11.240505, lng: 79.723102 };
const CAMPUS_RADIUS_METERS = 50000;

// 🔹 Helper: distance between two lat/lon in meters
function distanceBetweenPoints(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Attendance() {
  const navigate = useNavigate();
  const [wifiVerified, setWifiVerified] = useState(false);
  const [geoVerified, setGeoVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);
  const [marked, setMarked] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [wifiLoading, setWifiLoading] = useState(false);

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [expectedRoomId, setExpectedRoomId] = useState("CSE-202");

  const [now, setNow] = useState(new Date());
  const [activeSession, setActiveSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const token = localStorage.getItem("token");

  // 🔹 Pro GPS states
  const [location, setLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [distanceFromCampus, setDistanceFromCampus] = useState(null);
  const watcherId = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(id);
      if (watcherId.current && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, []);

  // Fetch active attendance session
  useEffect(() => {
    const fetchActiveSession = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/student/active", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (res.ok && data.session) {
          setActiveSession(data.session);
          setTimeRemaining(data.timeRemaining || 0);
        } else {
          setActiveSession(null);
          setTimeRemaining(0);
        }
      } catch (err) {
        console.log("No active attendance session");
      }
    };
    fetchActiveSession();
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // 🔹 Auto-Prompt for Wi-Fi when session is active and not verified
  useEffect(() => {
    if (activeSession && !wifiVerified && !loading) {
      // Don't overwrite error messages, but show prompt if idle
      setStatusMsg((prev) => (prev.includes("❌") || prev.includes("Verified") ? prev : "Please verify Wi-Fi to proceed ⚠️"));
    }
  }, [activeSession, wifiVerified, loading]);

  // 🔹 Auto-Open Face Scan after Wi-Fi is verified (if not already verified)
  useEffect(() => {
    if (wifiVerified && !faceVerified && !showFaceModal) {
      const timer = setTimeout(() => setShowFaceModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [wifiVerified, faceVerified, showFaceModal]);

  // GPS Tracking
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setStatusMsg("Location not supported on this device ❌");
      setLocationStatus("error");
      return;
    }
    setStatusMsg("Searching for GPS…");
    setLocationStatus("searching");

    if (watcherId.current && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(watcherId.current);
    }

    watcherId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (accuracy && accuracy > 50000) return;

        const distCampus = distanceBetweenPoints(latitude, longitude, CAMPUS_CENTER.lat, CAMPUS_CENTER.lng);

        setLocation((prev) => {
          if (prev) {
            const drift = distanceBetweenPoints(prev.lat, prev.lng, latitude, longitude);
            if (drift > 2000 && distCampus < 5000) return prev;
          }
          setLocationAccuracy(accuracy);
          setDistanceFromCampus(distCampus);
          if (distCampus <= CAMPUS_RADIUS_METERS && accuracy <= 150) {
            setLocationStatus("locked");
          } else {
            setLocationStatus("weak");
          }
          return { lat: latitude, lng: longitude };
        });
      },
      (err) => {
        setLocationStatus("error");
        setStatusMsg("Location access blocked ❌");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  };

  // Verifications
  const [wifiScanResult, setWifiScanResult] = useState(null); // Store scan result



  const verifyWifi = async () => {
    if (marked) return;
    setWifiLoading(true);
    setStatusMsg("Verifying Wi-Fi location...");
    try {
      // TODO: Replace with Real WifiScanner.scan()
      // const scanData = await WifiScanner.scan();

      // Simulate Success for now (Ensure this matches your Trained Room for testing)
      const scanData = {
        ssid: "HITECHCMD-21",
        bssid: "00:11:22:33:44:55",
        gateway: "172.16.0.1",
        rssi: -60
      };

      setTimeout(() => {
        setWifiVerified(true);
        setWifiScanResult(scanData); // Store for API call
        setStatusMsg("Wi-Fi Verified ✔");
        setWifiLoading(false);
        setTimeout(() => setShowFaceModal(true), 500);
      }, 1500);
    } catch (err) {
      setWifiLoading(false);
      setStatusMsg("Wi-Fi verification failed");
    }
  };

  const verifyGeo = async () => {
    if (marked) return;
    setGeoLoading(true);
    if (!location) {
      startGpsTracking();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    // Simplified logic for demo
    setGeoVerified(true);
    setStatusMsg("Location Verified ✔");
    setGeoLoading(false);
    setTimeout(() => setShowFaceModal(true), 500);
  };

  const verifyFace = () => {
    setFaceVerified(true);
    setStatusMsg("Face Verified ✔");
  };

  const scanQR = () => {
    // Simulate QR
    setQrVerified(true);
    setStatusMsg("QR Scan Successful ✔");
  };

  const markAttendance = async () => {
    if (!faceVerified && !qrVerified) {
      setStatusMsg("Complete verification first");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/student/mark", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession._id,
          wifiScan: wifiScanResult, // Send captured WiFi data
          faceVerified: true
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg("Attendance Marked Successfully ✔");
        setMarked(true);
        // Optional: vibrate
        if (navigator.vibrate) navigator.vibrate(200);
      } else {
        setStatusMsg(data.message || "Failed to mark attendance");
      }
    } catch (err) {
      setStatusMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 py-3 z-30 flex items-center justify-between">
        <h1 className="text-xl font-bold text-black tracking-tight">Attendance</h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-gray-500">Live</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* Status Card */}
        {activeSession ? (
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activeSession.subject}</h2>
                <p className="text-sm text-gray-500 font-medium">{activeSession.facultyName}</p>
              </div>
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')} left
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
              <Clock size={14} />
              <span>Period {activeSession.period} • {activeSession.startTime} - {activeSession.endTime}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center border border-gray-100/50 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Active Session</h3>
            <p className="text-sm text-gray-500 mt-1">Attendance will appear here when class starts.</p>
          </div>
        )}

        {/* Verification Methods - Apple Settings Style */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-4">Verification Methods</h3>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">

            {/* WiFi Item */}
            <div
              className={`flex items-center p-4 border-b border-gray-100 last:border-0 transition-colors ${activeSession && !marked
                ? 'hover:bg-gray-50 cursor-pointer'
                : 'opacity-60 cursor-not-allowed grayscale'
                }`}
              onClick={activeSession && !marked ? verifyWifi : undefined}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${wifiVerified ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                <Wifi size={18} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900">Wi-Fi Check</p>
                <p className="text-xs text-gray-500">
                  {activeSession ? "Verify classroom network" : "Waiting for session..."}
                </p>
              </div>
              {wifiLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : wifiVerified ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <ChevronRight size={20} className="text-gray-300" />
              )}
            </div>

            {/* Location Item */}
            <div className="flex items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={verifyGeo}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${geoVerified ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900">Location Check</p>
                <p className="text-xs text-gray-500">Verify campus presence</p>
              </div>
              {geoLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : geoVerified ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <ChevronRight size={20} className="text-gray-300" />
              )}
            </div>

            {/* Face Item */}
            <div
              className={`flex items-center p-4 border-b border-gray-100 last:border-0 transition-colors ${wifiVerified && !marked
                ? 'hover:bg-gray-50 cursor-pointer'
                : 'opacity-60 cursor-not-allowed grayscale'
                }`}
              onClick={() => wifiVerified && !marked && setShowFaceModal(true)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${faceVerified ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'}`}>
                <ScanFace size={18} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900">Face Scan</p>
                <p className="text-xs text-gray-500">
                  {wifiVerified ? "Biometric confirmation" : "Complete Wi-Fi check first"}
                </p>
              </div>
              {faceVerified ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <ChevronRight size={20} className="text-gray-300" />
              )}
            </div>

            {/* QR Item */}
            <div className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={scanQR}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${qrVerified ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'}`}>
                <QrIcon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900">Scan QR Code</p>
                <p className="text-xs text-gray-500">Alternative verification</p>
              </div>
              {qrVerified ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <ChevronRight size={20} className="text-gray-300" />
              )}
            </div>

          </div>
        </div>

        {/* Map Preview */}
        {location && (
          <div className="rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 bg-white p-1">
            <div className="h-48 rounded-xl overflow-hidden relative">
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                dragging={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <Marker position={[location.lat, location.lng]} />
              </MapContainer>
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-medium shadow-sm z-[400] text-gray-600">
                Accuracy: {locationAccuracy?.toFixed(0)}m
              </div>
            </div>
          </div>
        )}

        {/* Action Button - Static (Not Floating) */}
        <div className="mt-6 mb-8 flex justify-center">
          <button
            onClick={activeSession && !marked ? markAttendance : undefined}
            disabled={loading || (!faceVerified && !qrVerified) || marked}
            className={`w-full sm:w-auto px-10 py-3 rounded-2xl font-semibold text-sm shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 min-w-[200px] ${loading || (!faceVerified && !qrVerified) || marked
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#007AFF] text-white shadow-blue-500/30 hover:shadow-blue-500/40"
              }`}
          >
            {loading ? (
              <span className="animate-pulse">Marking...</span>
            ) : marked ? (
              <>
                <Check size={20} /> Attendance Marked
              </>
            ) : (
              <>
                Mark Attendance
              </>
            )}
          </button>
        </div>

        {statusMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl pointer-events-none animate-in fade-in slide-in-from-top-4">
            {statusMsg}
          </div>
        )}

        {/* Face Modal */}
        {showFaceModal && (
          <FaceScanModal
            onVerified={verifyFace}
            onClose={() => setShowFaceModal(false)}
          />
        )}

      </div>
    </div>
  );
}
