import {
  Home,
  User,
  Calendar,
  UserCheck,
  BookOpen,
  BarChart2,
  Briefcase,
  MessageSquare,
  Send,
  Star,
  LogOut
} from "lucide-react";

export default function Sidebar({ currentPage, setCurrentPage, selectedUserType }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "profile", label: "My Profile", icon: User },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "attendance", label: "My Attendance", icon: UserCheck },
    { id: "assessment", label: "My Assessment", icon: BookOpen },
    { id: "performance", label: "My Performance", icon: BarChart2 },
    { id: "leave", label: "Leave/OD Request", icon: Briefcase },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "suggestion", label: "Suggestion Box", icon: Send },
    { id: "feedback", label: "Feedback Panel", icon: Star }
  ];

  return (
    <div className="w-16 md:w-56 bg-blue-700 text-white flex flex-col p-4 space-y-2 h-full transition-all duration-300">
      <div className="mb-6 pt-2 hidden md:block">
        <p className="text-xl font-bold">Vidyatra</p>
        <p className="text-xs text-blue-300">{selectedUserType} Panel</p>
      </div>

      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          className={`flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
            currentPage === item.id
              ? "bg-blue-600 shadow-md font-bold"
              : "hover:bg-blue-600/70 text-blue-100"
          }`}
        >
          <item.icon className="w-6 h-6 shrink-0 md:mr-3" />
          <span className="hidden md:inline">{item.label}</span>
        </button>
      ))}

      <div className="flex-grow" />

      <button
        onClick={() => setCurrentPage("login")}
        className="flex items-center text-red-300 hover:text-red-500 font-medium mt-4"
      >
        <LogOut className="w-5 h-5 mr-1" /> Logout
      </button>
    </div>
  );
}

