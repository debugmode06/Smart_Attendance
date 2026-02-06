// src/admin/AdminLayout.jsx
import DashboardLayout from "../components/DashboardLayout";
import {
  Home,
  Users,
  UserCog,
  Layers,
  CalendarCog,
  Megaphone,
  Settings,
} from "lucide-react";

export default function AdminLayout() {
  const items = [
    { label: "Dashboard", path: "dashboard", icon: Home },
    { label: "Students", path: "students", icon: Users },
    { label: "Faculty", path: "faculty", icon: UserCog },
    { label: "Classes", path: "classes", icon: Layers },
    { label: "Timetable", path: "timetable", icon: CalendarCog },
    { label: "Announcements", path: "announcements", icon: Megaphone },
    { label: "Settings", path: "settings", icon: Settings },
  ];

  return <DashboardLayout sidebarItems={items} title="Admin Panel" />;
}

