import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../config/api";

export default function FaceScanModal({ onVerified, onClose }) {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(false);
  const streamRef = useRef(null);
  const scanAttemptRef = useRef(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Start automatic scanning after camera loads
        setTimeout(() => {
          autoScan();
        }, 1500);
      } catch (err) {
        console.error("Camera error:", err);
        setMessage("Cannot access camera");
        setError(true);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const autoScan = () => {
    if (!videoRef.current || scanning) return;

    setScanning(true);
    setError(false);
    setMessage("Scanning your face...");
    scanAttemptRef.current += 1;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setScanning(false);
          return;
        }

        setLoading(true);

        try {
          const formData = new FormData();
          formData.append("image", blob, "face.jpg");

          const res = await fetch(
            `${API_BASE}/student/attendance/face-scan`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
              },
              body: formData,
            }
          );

          const data = await res.json();

          if (res.ok) {
            setMessage("Face matched ✅");
            setError(false);
            setScanning(false);

            // Mark face as verified
            await onVerified();

            // Auto-close after success
            setTimeout(() => {
              setLoading(false);
              // Stop camera
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
              }
              onClose();
            }, 800);
          } else {
            // Face not matched - show error and retry
            console.error("Face verification failed:", data);
            setMessage(data.message || "Face not matched");
            setError(true);
            setLoading(false);
            setScanning(false);

            // Retry after 2 seconds
            setTimeout(() => {
              autoScan();
            }, 2000);
          }
        } catch (err) {
          console.error("Face verification error:", err);
          setError(true);
          setLoading(false);
          setScanning(false);

          if (err.message?.includes("Failed to fetch")) {
            setMessage("Cannot connect to server");
          } else {
            setMessage("Connection error");
          }

          // Retry after 2 seconds
          setTimeout(() => {
            autoScan();
          }, 2000);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">Face ID</h2>
          <p className="text-sm text-gray-300">
            {error ? "Try again" : scanning ? "Hold still..." : "Position your face in the frame"}
          </p>
        </div>

        {/* Video Container with iPhone-style frame */}
        <div className="relative w-full aspect-square mb-6">
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-3xl"
          />

          {/* Face scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Scanning frame */}
            <div className="relative w-64 h-80">
              {/* Animated scanning line */}
              {scanning && !error && (
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
                </div>
              )}

              {/* Corner brackets */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 320">
                {/* Top-left corner */}
                <path
                  d="M 40 10 L 10 10 L 10 40"
                  stroke={error ? "#ef4444" : scanning ? "#22c55e" : "#ffffff"}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className={scanning && !error ? "animate-pulse" : ""}
                />
                {/* Top-right corner */}
                <path
                  d="M 216 10 L 246 10 L 246 40"
                  stroke={error ? "#ef4444" : scanning ? "#22c55e" : "#ffffff"}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className={scanning && !error ? "animate-pulse" : ""}
                />
                {/* Bottom-left corner */}
                <path
                  d="M 40 310 L 10 310 L 10 280"
                  stroke={error ? "#ef4444" : scanning ? "#22c55e" : "#ffffff"}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className={scanning && !error ? "animate-pulse" : ""}
                />
                {/* Bottom-right corner */}
                <path
                  d="M 216 310 L 246 310 L 246 280"
                  stroke={error ? "#ef4444" : scanning ? "#22c55e" : "#ffffff"}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className={scanning && !error ? "animate-pulse" : ""}
                />
              </svg>

              {/* Center face icon */}
              {!scanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Success checkmark */}
              {!error && message.includes("matched") && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Error X mark */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-shake">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status message */}
        <div className="text-center mb-6">
          <p className={`text-base font-medium ${error ? "text-red-400" :
            message.includes("matched") ? "text-green-400" :
              "text-white"
            }`}>
            {message || "Initializing camera..."}
          </p>
          {error && (
            <p className="text-sm text-gray-400 mt-2">Retrying automatically...</p>
          )}
        </div>

        {/* Loading indicator */}
        {loading && !error && (
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(320px); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}


