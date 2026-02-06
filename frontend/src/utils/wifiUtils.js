/**
 * Utility to get current Wi-Fi SSID
 * Note: Requires native plugin (Capacitor/Cordova) to work on mobile.
 * Fallback to 'Unknown' or mock in dev.
 */
export const getCurrentSSID = async () => {
    // 1. Capacitor/Cordova Plugin Check
    if (window.WifiWizard2) {
        return new Promise((resolve) => {
            window.WifiWizard2.getConnectedSSID(
                (ssid) => resolve(ssid ? ssid.replace(/"/g, '') : null),
                () => resolve(null)
            );
        });
    }

    // 2. Browser Environment / Dev Mock
    // In a real browser, you cannot get the SSID for security reasons.
    // For local dev, we might use a global window variable set by the parent app or .env
    if (process.env.NODE_ENV === 'development') {
        return window.MOCK_SSID || null;
    }

    return null;
};

/**
 * Validates if the current SSID matches the expected SSID for a room
 * @param {string} currentSsid 
 * @param {string} targetSsid 
 */
export const isSSIDValid = (currentSsid, targetSsid) => {
    if (!currentSsid || !targetSsid) return false;
    // Strict case-sensitive match (Standard for SSIDs)
    return currentSsid === targetSsid;
};
