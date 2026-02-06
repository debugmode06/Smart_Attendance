import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  School,
  Activity,
  UserPlus,
  Trash2,
  RefreshCcwDot,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    classes: 0,
  });

  const [activities, setActivities] = useState([]);

  const token = localStorage.getItem("token");

  const loadDashboard = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/dashboard", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();
      if (res.ok) {
        setStats(data.stats || { students: 0, faculty: 0, classes: 0 });
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-slate-300 mt-1 text-sm">System overview and activity monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={<Users className="w-7 h-7" />}
          title="Total Students"
          value={stats.students}
          gradient="from-blue-500 to-blue-600"
          bgGradient="from-blue-50 to-blue-100/50"
        />

        <StatCard
          icon={<GraduationCap className="w-7 h-7" />}
          title="Total Faculty"
          value={stats.faculty}
          gradient="from-purple-500 to-purple-600"
          bgGradient="from-purple-50 to-purple-100/50"
        />

        <StatCard
          icon={<School className="w-7 h-7" />}
          title="Total Classes"
          value={stats.classes}
          gradient="from-emerald-500 to-emerald-600"
          bgGradient="from-emerald-50 to-emerald-100/50"
        />
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent System Activity</h2>
              <p className="text-xs text-slate-500">Latest actions and updates</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{a.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{a.time}</p>
                  </div>

                  <div className="ml-4">
                    {a.action === "ADD" && (
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UserPlus className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    {a.action === "DELETE" && (
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    {a.action === "UPDATE" && (
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <RefreshCcwDot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, gradient, bgGradient }) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl text-white shadow-sm`}>
          {icon}
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-slate-800">{value}</span>
        </div>
      </div>
      <p className="text-slate-600 text-sm font-medium">{title}</p>
    </div>
  );
}


