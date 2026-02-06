import { useState, useEffect } from "react";
import FaceScanModal from "../../components/FaceScanModal";
import { CheckCircle, Clock, Wifi, MapPin, QrCode, Camera, AlertCircle, CheckSquare, Loader } from "lucide-react";
import { getCurrentSSID } from "../../utils/wifiUtils";

export default function AttendanceNew() {
  const [activeSession, setActiveSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);

  // Verification State
  const [wifiVerified, setWifiVerified] = useState(false);
  const [verifyingWifi, setVerifyingWifi] = useState(false);

  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

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

          // Check if already marked
          if (data.studentRecord && data.studentRecord.status === "present") {
            setAttendanceMarked(true);
            setWifiVerified(true);
          } else if (data.studentRecord?.wifiVerified) {
            setWifiVerified(true);
          }
        } else {
          setActiveSession(null);
          setTimeRemaining(0);
        }
      } catch (err) {
        console.log("No active attendance session");
        setActiveSession(null);
        setTimeRemaining(0);
      }
    };

    fetchActiveSession();
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Auto-verify WiFi on load
  useEffect(() => {
    if (activeSession && !wifiVerified && !verifyingWifi && !attendanceMarked) {
      handleVerifyWifi();
    }
  }, [activeSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyWifi = async () => {
    setVerifyingWifi(true);
    setErrorMsg("");

    try {
      const ssid = await getCurrentSSID();
      if (!ssid) {
        throw new Error("Could not detect Wi-Fi. Please ensure it is enabled.");
      }

      // Verify with backend
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/student/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          sessionId: activeSession._id,
          wifiData: { ssid },
          checkOnly: true
        }),
      });

      if (res.ok) {
        setWifiVerified(true);
      } else {
        const data = await res.json();
        throw new Error(data.message || "WiFi verification failed. Connect to classroom WiFi.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setVerifyingWifi(false);
    }
  };

  const handleFaceScan = () => {
    if (!wifiVerified) {
      setErrorMsg("Please verify WiFi first.");
      return;
    }
    setShowFaceModal(true);
  };

  const handleFaceVerified = async () => {
    setLoading(true);
    try {
      const ssid = await getCurrentSSID();

      // Final Mark Attendance Call
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/student/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          sessionId: activeSession._id,
          wifiData: { ssid },
          wifiVerified: true,
          faceVerified: true
        }),
      });

      if (res.ok) {
        setAttendanceMarked(true);
        setStatusMsg("Attendance marked successfully ✓");
        setShowFaceModal(false);
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Failed to mark attendance final step.");
        setShowFaceModal(false);
      }
    } catch (err) {
      setErrorMsg("Network error during final marking.");
      setShowFaceModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f7fa' }}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Hero Header - iOS Style */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.1)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.08)', transform: 'translate(-20%, 20%)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.5px' }}>
                  Attendance
                </h1>
                <p className="text-white/80 text-sm font-medium">
                  Verified Presence System
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: attendanceMarked ? '#e6f7ed' : '#e3f2fd',
              border: `2px solid ${attendanceMarked ? '#4caf50' : '#2196f3'}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: attendanceMarked ? '#4caf50' : '#2196f3' }}>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold" style={{ color: attendanceMarked ? '#2e7d32' : '#1976d2' }}>
              {statusMsg}
            </span>
          </div>
        )}

        {/* Session Card */}
        {activeSession ? (
          <div className="space-y-4">
            {/* Active Session Info */}
            <div
              className="rounded-3xl p-6"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#1a1a1a', letterSpacing: '-0.3px' }}>
                  Active Session
                </h2>
                {timeRemaining > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
                    <Clock className="w-4 h-4" style={{ color: '#f57c00' }} />
                    <span className="font-bold text-sm" style={{ color: '#e65100' }}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
                  <span className="text-sm font-medium" style={{ color: '#757575' }}>Subject</span>
                  <span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeSession.subject}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
                  <span className="text-sm font-medium" style={{ color: '#757575' }}>Class</span>
                  <span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeSession.className} ({activeSession.roomId})</span>
                </div>
                <div className="flex justify-between items-center py-3 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" /> WiFi Required
                  </span>
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Face Scan Required
                  </span>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="rounded-2xl p-4 bg-red-50 border border-red-200 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span className="text-red-700 font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Mark Attendance Card */}
            <div
              className="rounded-3xl p-8"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              {attendanceMarked ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: '#e8f5e9' }}>
                    <CheckCircle className="w-10 h-10" style={{ color: '#4caf50' }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#2e7d32', letterSpacing: '-0.5px' }}>
                      Attendance Marked
                    </h3>
                    <p className="text-sm" style={{ color: '#757575' }}>
                      You have successfully marked your attendance for this session
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">WiFi Verified</span>
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">Face Verified</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center text-slate-800">
                    <h3 className="text-xl font-bold mb-2">Verification Steps</h3>
                    <p className="text-sm text-slate-500">Complete both steps to mark attendance</p>
                  </div>

                  {/* Step 1: WiFi */}
                  <div className={`p-4 rounded-2xl border-2 transition-all ${wifiVerified ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${wifiVerified ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Wifi className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700">1. WiFi Verification</span>
                      </div>
                      {wifiVerified && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>

                    {!wifiVerified && (
                      <button
                        onClick={handleVerifyWifi}
                        disabled={verifyingWifi}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                      >
                        {verifyingWifi ? <Loader className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                        {verifyingWifi ? "Verifying..." : "Verify Connection"}
                      </button>
                    )}
                  </div>

                  {/* Step 2: Face Scan */}
                  <div className={`p-4 rounded-2xl border-2 transition-all ${!wifiVerified ? 'opacity-50' : 'opacity-100 bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${faceVerified ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700">2. Face Verification</span>
                      </div>
                    </div>

                    <button
                      onClick={handleFaceScan}
                      disabled={!wifiVerified}
                      className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 ${!wifiVerified
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white shadow-purple-200 hover:bg-purple-700 active:scale-95'}`}
                    >
                      <Camera className="w-4 h-4" />
                      Start Face Scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* No Active Session */
          <div
            className="rounded-3xl p-12 text-center"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: '#f5f5f5' }}>
              <Clock className="w-12 h-12" style={{ color: '#9e9e9e' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#1a1a1a', letterSpacing: '-0.5px' }}>
              No Active Session
            </h3>
            <p className="text-sm" style={{ color: '#757575', maxWidth: '400px', margin: '0 auto' }}>
              There is no active attendance session at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Face Scan Modal */}
      {showFaceModal && (
        <FaceScanModal
          onVerified={handleFaceVerified}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
}
