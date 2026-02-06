import { useEffect, useRef, useState } from "react";

export default function FaceRegistrationModal({ open, onClose }) {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!open) return;

    let stream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setMessage("Cannot access camera");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open]);

  const handleRegister = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setLoading(true);
      setMessage("");

      try {
        const formData = new FormData();
        formData.append("image", blob, "face.jpg");

        const res = await fetch(
          "https://smart-face-attendance-mfkt.onrender.com/api/student/face/register",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
            },
            body: formData, // DO NOT set Content-Type manually
          }
        );

        const data = await res.json();

        if (res.ok) {
          setMessage("Face registered successfully ✅");
          setTimeout(() => {
            setLoading(false);
            onClose();
          }, 800);
        } else {
          setMessage(data.message || "Failed to register face");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setMessage("Error talking to server");
        setLoading(false);
      }
    }, "image/jpeg");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Register Your Face</h2>
        <p className="text-sm text-gray-600 mb-2">
          Position your face clearly in the camera and click{" "}
          <b>Register Face</b>.
        </p>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-64 bg-black rounded-lg mb-3"
        />

        {message && (
          <p className="text-sm mb-2 text-center text-blue-600">{message}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-gray-300 text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleRegister}
            className="px-3 py-1.5 rounded-md bg-green-600 text-white"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Face"}
          </button>
        </div>
      </div>
    </div>
  );
}


