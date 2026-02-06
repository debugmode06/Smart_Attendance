"""
Wi-Fi Fingerprint Trainer for Smart Attendance System
=====================================================
This script runs on Windows and collects Wi-Fi fingerprints using netsh.

Usage:
    python wifi_fingerprint_trainer.py

Output:
    Creates JSON file: fingerprint_<roomId>.json
"""

import subprocess
import json
import re
import sys
import time
from collections import defaultdict
from datetime import datetime
from typing import Dict, List


def scan_wifi_networks() -> List[Dict[str, float]]:
    """
    Run netsh command to get Wi-Fi networks with BSSID.
    Returns list of dicts: [{"bssid": "...", "rssi": -XX.X}, ...]
    """
    try:
        result = subprocess.run(
            ["netsh", "wlan", "show", "networks", "mode=bssid"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore"
        )

        if result.returncode != 0:
            print(f"❌ Error running netsh: {result.stderr}")
            return []

        output = result.stdout
        networks: List[Dict[str, float]] = []

        current_bssid: str | None = None
        current_signal: float | None = None

        for line in output.split("\n"):
            line = line.strip()

            # BSSID line
            if "BSSID" in line and ":" in line:
                parts = line.split(":", 1)
                if len(parts) > 1:
                    bssid_str = parts[1].strip()
                    if re.match(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", bssid_str):
                        current_bssid = bssid_str.replace("-", ":").lower()

            # Signal line
            elif "Signal" in line and "%" in line:
                match = re.search(r"(\d+)%", line)
                if match:
                    signal_percent = int(match.group(1))
                    # Convert % to approx RSSI
                    current_signal = -100 + (signal_percent * 0.7)

            # Save one AP block
            if current_bssid and current_signal is not None:
                rounded_signal = float(f"{current_signal:.1f}")
                networks.append({
                    "bssid": current_bssid,
                    "rssi": rounded_signal
                })
                current_bssid = None
                current_signal = None

        return networks

    except Exception as e:
        print(f"❌ Error scanning Wi-Fi: {e}")
        return []


def collect_fingerprint(room_id: str, num_scans: int = 30) -> Dict:
    """
    Collect multiple scans and average RSSI per BSSID.
    """
    print(f"\n📡 Collecting fingerprint for room: {room_id}")
    print(f"   Performing {num_scans} scans...\n")

    bssid_rssis: Dict[str, List[float]] = defaultdict(list)
    ssid_counts: Dict[str, int] = {}

    for scan_num in range(1, num_scans + 1):
        print(f"   Scan {scan_num}/{num_scans}...", end="\r")
        
        # Detect active SSID
        try:
            res = subprocess.run(["netsh", "wlan", "show", "interfaces"], capture_output=True, text=True, errors="ignore")
            m = re.search(r'^\s+SSID\s+:\s+(.+)$', res.stdout, re.MULTILINE)
            if m: 
                s = m.group(1).strip()
                ssid_counts[s] = ssid_counts.get(s, 0) + 1
        except: pass

        networks = scan_wifi_networks()
        for net in networks:
            bssid_rssis[net["bssid"]].append(float(net["rssi"]))

        time.sleep(0.5)

    print(f"\n   ✅ Completed {num_scans} scans\n")

    primary_ssid: str = "Unknown"
    if ssid_counts:
        # Sort by count and pick the top one to avoid type issues with max()
        sorted_ssids = sorted(ssid_counts.items(), key=lambda x: x[1], reverse=True)
        primary_ssid = sorted_ssids[0][0]

    # Minimum AP check
    if len(bssid_rssis) < 3:
        print(f"\n⚠️  WARNING: Only {len(bssid_rssis)} AP(s) detected.")
        print("   Minimum 3 APs recommended for Wi-Fi fingerprinting.\n")
        proceed = input("   Continue anyway? (y/n): ").strip().lower()
        if proceed != "y":
            sys.exit(0)

    fingerprint: Dict[str, float] = {}

    for bssid, rssi_list in bssid_rssis.items():
        scores: List[float] = list(rssi_list)

        # Outlier removal
        if len(scores) >= 10:
            scores.sort()
            trim = max(1, len(scores) // 10)
            if trim < len(scores) - trim:
                scores = scores[trim:len(scores) - trim]

        avg_rssi = sum(scores) / len(scores)
        fingerprint[bssid] = float(f"{avg_rssi:.1f}")

    fingerprint = dict(sorted(fingerprint.items()))

    return {
        "roomId": room_id,
        "ssid": primary_ssid, # CRITICAL for Frontend Guard
        "fingerprint": fingerprint,
        "createdAt": datetime.now().isoformat(),
        "numScans": num_scans,
        "numAPs": len(fingerprint)
    }


def save_fingerprint(data: Dict, filename: str | None = None) -> str | None:
    """
    Save fingerprint to JSON file.
    """
    if filename is None:
        filename = f"fingerprint_{data['roomId']}.json"

    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"✅ Fingerprint saved to: {filename}")
        print(f"   Room: {data['roomId']}")
        print(f"   APs: {data['numAPs']}")
        print(f"   Scans: {data['numScans']}\n")
        return filename

    except Exception as e:
        print(f"❌ Error saving file: {e}")
        return None


def main() -> None:
    print("=" * 60)
    print("Wi-Fi Fingerprint Trainer")
    print("Smart Attendance System")
    print("=" * 60)

    room_id = input("\nEnter classroom ID (e.g., CMD LAB): ").strip()
    if not room_id:
        print("❌ Room ID cannot be empty")
        sys.exit(1)

    scans_input = input("Number of scans (default 30): ").strip()
    num_scans = int(scans_input) if scans_input.isdigit() else 30

    try:
        data = collect_fingerprint(room_id, num_scans)
        filename = save_fingerprint(data)
        if not filename:
            sys.exit(1)

        print("🎉 Training completed successfully!")
        print("Next steps:")
        print("1) Upload JSON to backend")
        print("2) Verify CMD LAB appears in faculty panel")

    except KeyboardInterrupt:
        print("\n❌ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
