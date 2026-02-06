import { useEffect, useState } from "react";
import QRCode from "qrcode.react";

export default function LiveQR() {
  const [qrCode, setQrCode] = useState("");
  const [expiresIn, setExpiresIn] = useState(30);

  useEffect(() => {
    const fetchQR = async () => {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/student/qr/current");
      const data = await res.json();
      setQrCode(data.qrCode);
      setExpiresIn(data.expiresIn);
    };

    fetchQR();

    const interval = setInterval(fetchQR, 1000); // update countdown + auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Classroom QR (Auto Refresh)
      </h1>

      <QRCode value={qrCode} size={220} />

      <p className="text-gray-700 mt-4">
        Refreshing in: <strong>{expiresIn}s</strong>
      </p>

      <p className="text-sm text-gray-500 mt-2">
        Students must scan this QR to mark attendance.
      </p>
    </div>
  );
}


