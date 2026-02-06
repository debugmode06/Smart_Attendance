import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Lock, Save, Wifi, Upload, Trash2, AlertCircle } from "lucide-react";

export default function AdminSettings() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [password, setPassword] = useState({ old: "", new: "" });
  const [fingerprints, setFingerprints] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [trainingRoomId, setTrainingRoomId] = useState("");
  const [scanning, setScanning] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadFingerprints();
  }, []);

  const loadFingerprints = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/wifi-fingerprints", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.success) {
        setFingerprints(data.fingerprints);
      }
    } catch (err) {
      console.error("Load fingerprints error:", err);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus("");

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/wifi-fingerprints/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(jsonData),
          });

          const data = await res.json();
          if (data.success) {
            setUploadStatus(`✅ ${data.message}`);
            loadFingerprints();
          } else {
            setUploadStatus(`❌ ${data.message}`);
          }
        } catch (err) {
          setUploadStatus(`❌ Upload failed: ${err.message}`);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setUploadStatus(`❌ Error reading file: ${err.message}`);
      setUploading(false);
    }
  };

  /* Multi-Position Training State */
  const [trainingStep, setTrainingStep] = useState(0); // 0=Idle, 1=Front, 2=Mid, 3=Back
  const [positionSamples, setPositionSamples] = useState({ front: [], middle: [], back: [] });

  const resetTraining = () => {
    setTrainingStep(0);
    setPositionSamples({ front: [], middle: [], back: [] });
    setScanning(false);
    setUploadStatus("");
  };

  const performScanStep = async (position) => {
    if (!trainingRoomId.trim()) {
      setUploadStatus("⚠️ Please enter a specific Room ID");
      return;
    }

    setScanning(true);
    setUploadStatus(`Scanning from ${position.toUpperCase()} position...`);

    try {
      // SCANNIG LOOP: 7 Samples per position
      const SAMPLES_PER_POS = 7;
      let currentBatch = [];
      const TARGET_SSID = "HITECHCMD-21";

      // Simulate signal decay based on position (Front=Strong, Back=Weak)
      const baseSignal = position === "front" ? -45 : position === "middle" ? -55 : -65;

      for (let i = 0; i < SAMPLES_PER_POS; i++) {
        // Simulate: Wait 800ms between scans (Real world requirement)
        await new Promise(r => setTimeout(r, 800));

        // REAL PLUGN CALL WOULD BE:
        // const scanResult = await WifiScanner.scan();

        // Simulation:
        const noise = Math.floor(Math.random() * 10) - 5; // +/- 5dB fluctuation
        const sample = {
          ssid: TARGET_SSID,
          bssid: "00:1A:2B:3C:4D:5E",
          gateway: "172.16.0.1",
          rssi: baseSignal + noise,
          timestamp: Date.now()
        };
        currentBatch.push(sample);
        setUploadStatus(`${position.toUpperCase()}: Sample ${i + 1}/${SAMPLES_PER_POS} captured...`);
      }

      // Store batch
      setPositionSamples(prev => {
        const newState = { ...prev, [position]: currentBatch };

        // If this was BACK (Step 3), trigger finalization next
        if (position === "back") {
          setTimeout(() => finalizeTraining({ ...prev, back: currentBatch }), 500);
        }
        return newState;
      });

      // Advance Step
      if (position !== "back") {
        setTrainingStep(prev => prev + 1);
        setUploadStatus(`✅ ${position.toUpperCase()} Complete. Move to next position.`);
      }

    } catch (err) {
      setUploadStatus(`❌ Scan Failed: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const finalizeTraining = async (finalSamples) => {
    setUploadStatus("Processing Multi-Position Data...");
    setScanning(true);

    try {
      // 1. Merge All Samples
      const allSamples = [
        ...finalSamples.front,
        ...finalSamples.middle,
        ...finalSamples.back
      ];

      // 2. Remove Outliers (Top/Bottom 10%)
      const sortedRssi = allSamples.map(s => s.rssi).sort((a, b) => a - b);
      const dropCount = Math.ceil(sortedRssi.length * 0.10); // 10%

      // Slice middle 80%
      const validRssi = sortedRssi.slice(dropCount, sortedRssi.length - dropCount);

      if (validRssi.length === 0) throw new Error("Not enough valid samples after filtering");

      // 3. Compute Stats
      const sum = validRssi.reduce((a, b) => a + b, 0);
      const avgRssi = Math.round(sum / validRssi.length);

      // Variance
      const squareDiffs = validRssi.map(val => Math.pow(val - avgRssi, 2));
      const variance = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(variance);

      // Min Threshold (Average - 2*Sigma - Margin)
      const minAcceptedRssi = Math.floor(avgRssi - (stdDev * 2) - 5);

      // 4. Construct Payload
      const trainingPayload = {
        roomId: trainingRoomId,
        fingerprint: {
          ssid: "HITECHCMD-21",
          gateway: "172.16.0.1",
          bssidList: [...new Set(allSamples.map(s => s.bssid))], // Deduplicate BSSIDs
          stats: {
            avgRssi,
            minRssi: minAcceptedRssi,
            variance: parseFloat(variance.toFixed(2)),
            stdDev: parseFloat(stdDev.toFixed(2)),
            sampleCount: allSamples.length,
            trainedPositions: ["front", "middle", "back"]
          },
          trainedAt: new Date().toISOString(),
          trainedBy: "Faculty (Multi-Pos)"
        }
      };

      // 5. Upload
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/wifi-fingerprints/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(trainingPayload),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        setUploadStatus(`✅ Training Success! Defined Range: ${minAcceptedRssi} dBm (Avg: ${avgRssi})`);
        loadFingerprints();
        setTimeout(resetTraining, 3000);
      } else {
        setUploadStatus(`❌ Server Rejected: ${data.message}`);
      }

    } catch (err) {
      setUploadStatus(`❌ Processing Error: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  // Legacy delete
  const deleteFingerprint = async (roomId) => {
    // ... existing delete logic ...
    if (!window.confirm(`Delete fingerprint for ${roomId}?`)) return;
    try {
      const res = await fetch(`https://smart-face-attendance-mfkt.onrender.com/api/admin/wifi-fingerprints/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus(`✅ ${data.message}`);
        loadFingerprints();
      }
    } catch (err) {
      setUploadStatus(`❌ Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header code existing... */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        {/* ... header visuals ... */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Admin Settings</h2>
              <p className="text-slate-300 text-sm mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* WiFi Training Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-slate-800">WiFi Range Training</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            {/* Room ID Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-1">Target Room ID</label>
              <input
                type="text"
                placeholder="e.g. CSE-201"
                className="w-full border border-slate-300 rounded-lg px-4 py-2"
                value={trainingRoomId}
                onChange={(e) => setTrainingRoomId(e.target.value)}
                disabled={trainingStep > 0}
              />
            </div>

            {/* 3-Step Wizard UI */}
            {!trainingRoomId ? (
              <div className="text-center p-4 text-slate-500">Enter a Room ID to start training.</div>
            ) : (
              <div className="space-y-4">
                {/* Steps Indicator */}
                <div className="flex justify-between items-center mb-6 px-4">
                  {["Front", "Middle", "Back"].map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = trainingStep === stepNum;
                    const isDone = trainingStep > stepNum;
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 
                                           ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}
                                       `}>
                          {isDone ? "✓" : stepNum}
                        </div>
                        <span className={`text-xs ${isActive ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button */}
                <div className="p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-2">
                    {trainingStep === 0 ? "Ready to Start?" :
                      trainingStep === 1 ? "Step 1: Front of Class" :
                        trainingStep === 2 ? "Step 2: Middle of Class" :
                          "Step 3: Back of Class"}
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    {trainingStep === 0 ? "This ensures accurate range detection by sampling 3 key positions." :
                      trainingStep === 1 ? "Please walk to the FRONT (near whiteboard) and press Scan." :
                        trainingStep === 2 ? "Walk to the CENTER of the room and press Scan." :
                          "Walk to the REAR wall and press Scan."}
                  </p>

                  {trainingStep === 0 && (
                    <button onClick={() => setTrainingStep(1)} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                      Start Multi-Position Training
                    </button>
                  )}

                  {trainingStep === 1 && (
                    <button onClick={() => performScanStep('front')} disabled={scanning} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                      {scanning ? "Scanning Front..." : "Scan Front Position"}
                    </button>
                  )}

                  {trainingStep === 2 && (
                    <button onClick={() => performScanStep('middle')} disabled={scanning} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                      {scanning ? "Scanning Middle..." : "Scan Middle Position"}
                    </button>
                  )}

                  {trainingStep === 3 && (
                    <button onClick={() => performScanStep('back')} disabled={scanning} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                      {scanning ? "Scanning Back & Finalizing..." : "Scan Back & Finish"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Status Bar */}
            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-bold text-center ${uploadStatus.includes("✅") ? "bg-green-50 text-green-700" : uploadStatus.includes("Scanning") ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                {uploadStatus}
              </div>
            )}
          </div>

          {/* Legacy JSON Upload */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <span onClick={() => document.getElementById('wifi-upload-hidden').click()} className="text-xs text-slate-400 cursor-pointer hover:underline">
              Advanced: Upload JSON File
            </span>
            <input type="file" id="wifi-upload-hidden" className="hidden" accept=".json" onChange={handleFileUpload} />
          </div>
        </div>
      </div>


      {/* Fingerprints List */}
      {fingerprints.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Uploaded Fingerprints</h4>
          <div className="space-y-2">
            {fingerprints.map((fp) => (
              <div
                key={fp.roomId}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="font-medium text-slate-800">{fp.roomId}</p>
                  <p className="text-sm text-slate-600">
                    {fp.numAPs} APs | Updated: {new Date(fp.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteFingerprint(fp.roomId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete fingerprint"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Update Profile</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Old Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={password.old}
              onChange={(e) => setPassword({ ...password, old: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
            />
          </div>
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Update Password
          </button>
        </div>
      </div>
    </div >
  );
}


