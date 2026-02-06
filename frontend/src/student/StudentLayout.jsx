// src/student/StudentLayout.jsx
import DashboardLayout from "../components/DashboardLayout";
import FloatingMessageButton from "./components/FloatingMessageButton";
import {
  Home,
  Calendar,
  CheckSquare,
  User,
  BookOpen,
  LineChart,
  MessageCircle,
  MessageSquare,
  BrainCircuit,
  FileEdit,
  Lightbulb,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentLayout() {
  const items = [
    { label: "Dashboard", path: "dashboard", icon: Home },
    { label: "Schedule", path: "schedule", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: CheckSquare },
    { label: "AI Assistant", path: "ai", icon: BrainCircuit },
  ];

  const navigate = useNavigate();
  const lastSessionIdRef = useRef(null);
  const token = localStorage.getItem("token");

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Poll for active session
  useEffect(() => {
    const checkSession = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/student/active", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();

        if (res.ok && data.session) {
          // New session detected
          if (lastSessionIdRef.current !== data.session._id) {
            lastSessionIdRef.current = data.session._id;

            // Send Notification
            if ("Notification" in window && Notification.permission === "granted") {
              const notif = new Notification("Attendance Started! 📢", {
                body: `Faculty has started attendance for ${data.session.subject}. Tap to mark now!`,
                icon: "/pwa-192x192.png", // fallback or use valid path
                tag: "attendance-session"
              });

              notif.onclick = () => {
                window.focus();
                navigate("/student/attendance");
              };
            }
          }
        } else {
          lastSessionIdRef.current = null;
        }
      } catch (err) {
        // quiet fail
      }
    };

    // Check immediately and then every 10 seconds
    checkSession();
    const interval = setInterval(checkSession, 10000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  return (
    <>
      <DashboardLayout sidebarItems={items} title="Student Panel" />
      <FloatingMessageButton />
    </>
  );
}

