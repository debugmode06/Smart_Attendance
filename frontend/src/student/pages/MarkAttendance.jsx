// src/student/pages/MarkAttendance.jsx
import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  Camera,
  MapPin,
  AlertCircle,
  Loader,
  Check,
} from "lucide-react";
import { API_BASE } from "../../config/api";
import { getCurrentSSID } from "../../utils/wifiUtils";
import FaceScanModal from "../../components/FaceScanModal";

export default function MarkAttendance() {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0: Initial, 1: WiFi, 2: Face, 3: Success
  const [wifiVerified, setWifiVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [studentRecord, setStudentRecord] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [previousSessionId, setPreviousSessionId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch active session
  const fetchActiveSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance-session/student/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();

        // Check if this is a NEW session (show notification)
        if (data.session && data.session._id !== previousSessionId) {
          setShowNotification(true);
          setPreviousSessionId(data.session._id);
          // Hide notification after 5 seconds
          setTimeout(() => setShowNotification(false), 5000);

          // Play notification sound (optional)
          if (typeof Audio !== 'undefined') {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiJ0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnksBSt+zPLaizsIGGS37OihUBELTKXh8bllHAU2jdXyzoU2Bhxqvu7mnEoODlOq5O+zYBoHPJPZ88p8MAYmeMvx3I0+CRZiturqpVITC0mi4PG7axwGM4nU8tGHOQcaaLvs56FNEQ1Pqebvt2IcBz2U2/PJfS8GJ3nM8d2PQAQUY7Xp66lVEwtLo+HxvGscBTOJ1PLRhzoHGmi77OehTRENT6nm77diHAc9lNvzyX0vBid5zPHdjz8FFGSy6+upVRMLSqPh8bxrHAUzidTy0Yc6BxpouOznoU0RDU+p5u+3YhwHPZTb88l9LwYneczx3Y8/BRRksuvrqVUTC0qj4fG8axwFM4nU8tGHOgcaaLjs56FNEQ1Pqebvt2IcBz2U2/PJfS8GJ3nM8d2PPwUUZLLr66lVEwtKo+HxvGscBTOJ1PLRhzoHGmi47OehTRENT6nm77diHAc9lNvzyX0vBid5zPHdjz8FFGSy6+upVRMLSqPh8bxrHAUzidTy0Yc6BxpouOznoU0RDU+p5u+3YhwHPZTb88l9LwYneczx3Y8/BRRksuvrqVUTC0qj4fG8axwFM4nU8tGHOgcaaLjs56FNEQ1Pqebvt2IcBz2U2/PJfS8GJ3nM8d2PPwUUZLLr66lVEwtKo+HxvGscBTOJ1PLRhzoHGmi47OehTRENT6nm77diHAc9lNvzyX0vBid5zPHdjz8FFGSy6+upVRMLSqPh8bxrHAUzidTy0Yc6BxpouOznoU0RDU+p5u+3YhwHPZTb88l9LwYneczx3Y8/BRRksuvrqVUTC0qj4fG8axwFM4nU8tGHOgcaaLjs56FNEQ1Pqebvt2IcBz2U2/PJfS8GJ3nM8d2PPwUUZLLr66lVEwtKo+HxvGscBTOJ1PLRhzoHGmi47OehTRENT6nm77diHAc9lNvzyX0vBid5zPHdjz8FFGSy6+upVRMLSqPh8bxrHAUzidTy0Yc6BxpouOznoU0RDU+p5u+3YhwHPZTb88l9LwYneczx3Y8/BRRksuvrqVUTC0qj4fG8axwFM4nU8tGHOgcaaLjs56FNEQ1Pqebvt2IcBz2U2/PJfS8GJ3nM8d2PPwUUZLLr66lVEwtKo+HxvGscBTOJ1PLRhzoHGmi47OehTRENT6nm77diHAc9lNvzyX0vBid5zPHdjz8FFGSy6+upVRMLSqPh8bxrHAU=');
            audio.play().catch(() => { });
          }
        }

        setActiveSession(data.session);
        setStudentRecord(data.studentRecord);
        setTimeRemaining(data.timeRemaining);

        // Check if already marked
        if (data.studentRecord && data.studentRecord.status === "present") {
          setCurrentStep(3);
          setWifiVerified(data.studentRecord.wifiVerified);
          setFaceVerified(data.studentRecord.faceVerified);
        }
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      console.error("Error fetching active session:", error);
    } finally {
      setLoading(false);
    }
  };

  // WiFi Verification
  const handleWiFiVerification = async () => {
    setVerifying(true);
    setError("");

    try {
      const ssid = await getCurrentSSID();
      if (!ssid) {
        throw new Error("Could not detect Wi-Fi SSID. Please ensure Wi-Fi is on.");
      }

      // We'll use the record marking endpoint to check wifi
      const res = await fetch(`${API_BASE}/attendance-session/student/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: activeSession._id,
          wifiData: { ssid },
          checkOnly: true // We can add a flag if we want but for now we follow the flow
        }),
      });

      if (res.ok) {
        setWifiVerified(true);
        setCurrentStep(2); // Move to face verification
      } else {
        const data = await res.json();
        setError(data.message || "WiFi verification failed. You must be in the classroom.");
      }
    } catch (error) {
      console.error("WiFi verification error:", error);
      setError(error.message || "WiFi verification failed. Please ensure you are connected to the classroom WiFi.");
    } finally {
      setVerifying(false);
    }
  };

  // Face Verification Success Handler
  const handleFaceVerificationSuccess = () => {
    setFaceVerified(true);
    setShowFaceScan(false);
    markAttendance();
  };

  // TEMPORARY: Skip face verification for testing
  const handleSkipFaceVerification = () => {
    setFaceVerified(true);
    setShowFaceScan(false);
    markAttendance();
  };

  // Mark Attendance
  const markAttendance = async () => {
    setVerifying(true);
    setError("");

    try {
      const ssid = await getCurrentSSID();
      const res = await fetch(`${API_BASE}/attendance-session/student/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: activeSession._id,
          wifiData: { ssid },
          wifiVerified: true,
          faceVerified: true,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentStep(3); // Success
        fetchActiveSession(); // Refresh to get updated record
      } else {
        setError(data.message || "Failed to mark attendance");
        setCurrentStep(0); // Reset
        setWifiVerified(false);
        setFaceVerified(false);
      }
    } catch (error) {
      console.error("Mark attendance error:", error);
      setError("Failed to mark attendance. Please try again.");
      setCurrentStep(0);
      setWifiVerified(false);
      setFaceVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  // Start marking process
  const handleStartMarking = () => {
    setWifiVerified(false);
    setCurrentStep(1); // Go to step 1 (WiFi)
    setError("");
  };

  // Update countdown timer
  useEffect(() => {
    if (activeSession && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            fetchActiveSession(); // Refresh when expired
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeSession, timeRemaining]);

  // Initial fetch
  useEffect(() => {
    fetchActiveSession();
    const interval = setInterval(fetchActiveSession, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-700">Loading attendance session...</span>
        </div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Session</h2>
          <p className="text-gray-600">
            There is no active attendance session at the moment. Please wait for your faculty to
            start a session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center gap-2 sm:gap-3 max-w-md mx-auto sm:mx-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg">New Attendance Session!</h3>
              <p className="text-xs sm:text-sm opacity-90 truncate">
                {activeSession?.facultyName} started attendance for {activeSession?.subject}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-2 text-white/80 hover:text-white flex-shrink-0"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Session Info Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-4">Active Attendance Session</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="opacity-90 mb-1">Subject</p>
              <p className="font-semibold text-lg">{activeSession.subject}</p>
            </div>
            <div>
              <p className="opacity-90 mb-1">Period</p>
              <p className="font-semibold text-lg">Period {activeSession.period}</p>
            </div>
            <div>
              <p className="opacity-90 mb-1">Faculty</p>
              <p className="font-semibold">{activeSession.facultyName}</p>
            </div>
            <div>
              <p className="opacity-90 mb-1">Time</p>
              <p className="font-semibold">
                {activeSession.startTime} - {activeSession.endTime}
              </p>
            </div>
          </div>
        </div>

        {/* Timer Card */}
        <div
          className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${timeRemaining === 0
            ? "bg-gradient-to-br from-red-500 to-red-600"
            : timeRemaining < 120
              ? "bg-gradient-to-br from-amber-500 to-amber-600"
              : "bg-gradient-to-br from-green-500 to-green-600"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Time Remaining</p>
                <p className="text-4xl font-bold">{formatTime(timeRemaining)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Status</p>
              <p className="text-xl font-semibold">
                {timeRemaining === 0
                  ? "Expired"
                  : timeRemaining < 120
                    ? "Hurry Up!"
                    : "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Already Marked Success */}
        {currentStep === 3 && studentRecord && studentRecord.status === "present" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Attendance Marked!</h2>
            <p className="text-green-700 mb-6">
              Your attendance has been successfully recorded at{" "}
              {new Date(studentRecord.markedAt).toLocaleTimeString()}
            </p>

            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <Wifi className="w-5 h-5" />
                <span>WiFi Verified</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Camera className="w-5 h-5" />
                <span>Face Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Marking Process */}
        {currentStep !== 3 && timeRemaining > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mark Your Attendance</h2>

            {/* Steps Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[
                  { label: "Start", icon: MapPin },
                  { label: "WiFi Check", icon: Wifi },
                  { label: "Face Scan", icon: Camera },
                  { label: "Complete", icon: CheckCircle },
                ].map((step, index) => (
                  <div key={index} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep > index
                          ? "bg-green-500 text-white"
                          : currentStep === index
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-400"
                          }`}
                      >
                        <step.icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs mt-2 font-medium text-gray-600">{step.label}</p>
                    </div>
                    {index < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${currentStep > index ? "bg-green-500" : "bg-gray-200"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 0: Initial */}
            {currentStep === 0 && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Click the button below to start the attendance marking process. You will need to
                  verify your location via WiFi and complete a face scan.
                </p>
                <button
                  onClick={handleStartMarking}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg"
                >
                  Start Marking Attendance
                </button>
              </div>
            )}

            {/* Step 1: WiFi Verification */}
            {currentStep === 1 && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 mb-2">WiFi Verification</h3>
                      <p className="text-blue-700 text-sm">
                        We need to verify that you are physically present in the classroom. Please
                        ensure you are connected to the classroom WiFi network.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWiFiVerification}
                  disabled={verifying}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Verifying WiFi...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-5 h-5" />
                      Verify WiFi Location
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Face Verification */}
            {currentStep === 2 && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-green-900">WiFi Verified Successfully</span>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900 mb-2">Face Verification</h3>
                      <p className="text-purple-700 text-sm">
                        Please complete the face scan to verify your identity and mark your
                        attendance.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowFaceScan(true)}
                  disabled={verifying}
                  className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
                >
                  {verifying ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Start Face Scan
                    </>
                  )}
                </button>

                {/* Temporary Skip Button for Testing */}
                <button
                  onClick={handleSkipFaceVerification}
                  disabled={verifying}
                  className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  <Check className="w-4 h-4" />
                  Skip Face Verification (Testing Only)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Time Expired */}
        {timeRemaining === 0 && currentStep !== 3 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Time Expired</h2>
            <p className="text-red-700">
              The attendance marking window has closed. You will be marked as absent for this
              session.
            </p>
          </div>
        )}

        {/* Face Scan Modal */}
        {showFaceScan && (
          <FaceScanModal
            open={showFaceScan}
            onClose={() => setShowFaceScan(false)}
            onVerified={handleFaceVerificationSuccess}
          />
        )}
      </div>
    </div>
  );
}


