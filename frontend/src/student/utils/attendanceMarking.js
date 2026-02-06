// STUDENT ATTENDANCE HELPER
import { API_BASE } from '../../config/api';

/**
 * Captures current Wi-Fi state and submits attendance
 * @param {string} sessionId - The active session ID
 * @param {object} faceData - result from face verification
 */
export const markStudentAttendance = async (sessionId, faceData) => {
    try {
        // 1. Capture Wi-Fi Data
        // NOTE: This requires the Capacitor WifiWizard2 or similar plugin
        // If testing in browser, this will fail or mock.
        let wifiData = null;

        if (window.WifiManager) {
            // Native Android Interface
            wifiData = await new Promise((resolve, reject) => {
                window.WifiManager.getConnectionInfo(
                    (info) => resolve({
                        ssid: info.SSID,
                        bssid: info.BSSID,
                        rssi: info.RSSI
                    }),
                    (err) => reject(new Error("Wi-Fi Scan Failed: " + err))
                );
            });
        } else {
            console.warn("Using MOCK Wi-Fi for Browser Dev");
            // Mock for testing only
            wifiData = {
                ssid: "College-WiFi",
                bssid: "aa:bb:cc:dd:ee:01", // Make sure this matches a trained room in DB for testing
                rssi: -50
            };
        }

        if (!wifiData) throw new Error("Could not retrieve Wi-Fi data");

        // 2. Submit to Backend
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/attendance-session/student/mark`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId,
                faceVerified: true, // simplified for this step
                wifiScan: wifiData   // Expected by backend verifyLocation
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Attendance Failed");

        return data;

    } catch (error) {
        console.error("Attendance Error:", error);
        throw error;
    }
};
