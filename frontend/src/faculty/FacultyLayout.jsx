// src/faculty/FacultyLayout.jsx
import DashboardLayout from "../components/DashboardLayout";
import FloatingMessageButton from "./components/FloatingMessageButton";
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  FileCheck,
  BookOpen,
  Layers,
  BrainCircuit,
  BarChart,
  MessageSquare,
  Settings,
} from "lucide-react";

export default function FacultyLayout() {
  const items = [
    { label: "Dashboard", path: "dashboard", icon: Home },
    { label: "Students", path: "students", icon: Users },
    { label: "Timetable", path: "timetable", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: FileCheck },
  ];

  return (
    <>
      <DashboardLayout sidebarItems={items} title="Faculty Panel" />
      <FloatingMessageButton />
    </>
  );
}

