import { useState } from 'react';
import { API_BASE } from '../../config/api';
// Assuming a global WifiWizard2 or Capacitor Wifi plugin is available
// import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2'; 
// For demo, we assume a simple window.WifiManager object is injected by the native shell or mocked

const useWifiTraining = () => {
    const [trainingState, setTrainingState] = useState('idle'); // idle, scanning, optimizing, uploading, success, error
    const [scans, setScans] = useState([]);
    const [currentStep, setCurrentStep] = useState(1); // 1: Front, 2: Middle, 3: Back
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const performScan = async () => {
        return new Promise((resolve, reject) => {
            try {
                // MOCK IMPLEMENTATION FOR BROWSER DEV
                if (!window.WifiManager) {
                    console.warn("Native WifiManager not found. Using Mock Data.");
                    setTimeout(() => {
                        resolve({
                            SSID: "College-WiFi",
                            BSSID: "aa:bb:cc:dd:ee:0" + Math.floor(Math.random() * 9),
                            level: -45 - Math.floor(Math.random() * 15), // -45 to -60
                            timestamp: Date.now()
                        });
                    }, 1000);
                    return;
                }

                // REAL IMPLEMENTATION (Example)
                // window.WifiManager.scan((results) => { ... })
                // For 'fingerprint', we want the connected Info OR a scan list
                // Based on user requirements "Capture Wi-Fi signal", likely `getScanResults` or `getConnectionInfo`

                // Let's assume we capture the CONNECTED AP's details for simplicity of the "fingerprint" model defined in backend
                // Or better, we capture the strongest AP from scan list matching the SSID.

                window.WifiManager.getConnectionInfo((info) => {
                    resolve({
                        SSID: info.SSID,
                        BSSID: info.BSSID,
                        level: info.RSSI,
                        timestamp: Date.now()
                    });
                }, (err) => reject(err));

            } catch (e) {
                reject(e);
            }
        });
    };

    const trainLocation = async (roomId) => {
        setTrainingState('scanning');
        setScans([]);
        addLog(`Starting training for ${roomId}`);

        try {
            const allScans = [];
            const SCANS_PER_STEP = 5;

            // We force 3 steps: Front, Middle, Back
            // But for the hook, we'll just run one continuous batch for the *current* step logic if we wanted UI control
            // To satisfy "System guides faculty... At each location perform 5-7 scans", let's do a loop here.

            for (let i = 0; i < SCANS_PER_STEP; i++) {
                addLog(`Scan ${i + 1}/${SCANS_PER_STEP}...`);
                const result = await performScan();
                allScans.push({
                    bssid: result.BSSID,
                    rssi: result.level,
                    ssid: result.SSID, // Validation
                    timestamp: result.timestamp
                });
                // Delay between scans
                await new Promise(r => setTimeout(r, 800));
            }

            setScans(p => [...p, ...allScans]);
            setTrainingState('idle');
            return allScans; // Return batch for local storage/UI confirmation

        } catch (err) {
            addLog(`Error: ${err.message}`);
            setTrainingState('error');
        }
    };

    const uploadTraining = async (roomId, ssid, finalScans) => {
        setTrainingState('uploading');
        try {
            // Transform for backend
            // Backend expects: { roomId, ssid, scans: [{bssid, rssi}] }

            const payload = {
                roomId,
                ssid,
                scans: finalScans.map(s => ({
                    bssid: s.bssid,
                    rssi: s.rssi
                }))
            };

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/wifi/train`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setTrainingState('success');
                addLog("Training Uploaded Successfully!");
            } else {
                throw new Error(data.message || "Upload failed");
            }
        } catch (e) {
            addLog(`Upload Error: ${e.message}`);
            setTrainingState('error');
        }
    };

    return {
        trainingState,
        scans,
        logs,
        trainLocation,
        uploadTraining,
        reset: () => { setScans([]); setLogs([]); setTrainingState('idle'); }
    };
};

export default useWifiTraining;
