import { useState } from "react";
import useWifiTraining from "../hooks/useWifiTraining";
import { Wifi, Save, CheckCircle, AlertTriangle, MapPin } from "lucide-react";

export default function WifiTrainingPage() {
    const { trainingState, scans, logs, trainLocation, uploadTraining, reset } = useWifiTraining();

    const [roomId, setRoomId] = useState("");
    const [step, setStep] = useState(0); // 0: Input, 1: Front, 2: Middle, 3: Back, 4: Review

    const handleStart = () => {
        if (!roomId) return alert("Enter Room ID");
        setStep(1);
    };

    const runStepScans = async () => {
        await trainLocation(roomId);
        if (step < 3) {
            setStep(s => s + 1);
        } else {
            setStep(4);
        }
    };

    const handleFinalSubmit = () => {
        // Check consistency
        if (scans.length < 15) return alert("Insufficient data. Please restart.");
        const ssid = scans[0].ssid; // Assume consistent SSID
        uploadTraining(roomId, ssid, scans);
    };

    return (
        <div className="p-4 max-w-lg mx-auto bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Wifi className="text-blue-600" /> Room Training
            </h1>

            {/* Step 0: Setup */}
            {step === 0 && (
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                        Ensure you are connected to the College WiFi before starting.
                    </div>
                    <input
                        className="w-full border p-3 rounded text-lg"
                        placeholder="Room ID (e.g. CSE-201)"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value.toUpperCase())}
                    />
                    <button
                        onClick={handleStart}
                        className="w-full bg-blue-600 text-white p-3 rounded font-bold"
                    >
                        Start Training
                    </button>
                </div>
            )}

            {/* Steps 1-3: Scanning */}
            {step >= 1 && step <= 3 && (
                <div className="text-center space-y-6">
                    <div className="p-6 bg-gray-100 rounded-full w-40 h-40 mx-auto flex items-center justify-center border-4 border-blue-500">
                        <MapPin className="w-16 h-16 text-blue-600" />
                    </div>

                    <h2 className="text-xl font-bold">
                        Step {step}: {step === 1 ? "Front Details" : step === 2 ? "Middle of Room" : "Back of Room"}
                    </h2>
                    <p className="text-gray-600">Stand at position and click Scan</p>

                    <button
                        disabled={trainingState === 'scanning'}
                        onClick={runStepScans}
                        className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
                    >
                        {trainingState === 'scanning' ? "Scanning..." : "Capture Signal"}
                    </button>

                    <div className="text-left text-xs bg-black text-green-400 p-2 rounded h-32 overflow-y-auto font-mono">
                        {logs.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>
            )}

            {/* Step 4: Review & Upload */}
            {step === 4 && (
                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                        <h3 className="font-bold text-green-800 flex items-center gap-2">
                            <CheckCircle size={20} /> Training Complete
                        </h3>
                        <p className="text-sm mt-1">
                            Collected {scans.length} samples.<br />
                            Average RSSI: {Math.round(scans.reduce((a, b) => a + b.rssi, 0) / scans.length)} dBm
                        </p>
                    </div>

                    <button
                        onClick={handleFinalSubmit}
                        disabled={trainingState === 'uploading' || trainingState === 'success'}
                        className="w-full bg-green-600 text-white p-4 rounded-xl font-bold shadow-lg"
                    >
                        {trainingState === 'uploading' ? "Uploading..." : trainingState === 'success' ? "Saved!" : "Save Fingerprint"}
                    </button>

                    {trainingState === 'success' && (
                        <button onClick={() => { reset(); setStep(0); setRoomId(""); }} className="w-full text-blue-600 underline">Train Another Room</button>
                    )}
                </div>
            )}
        </div>
    );
}
