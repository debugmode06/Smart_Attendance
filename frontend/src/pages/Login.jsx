import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, GraduationCap, Users, Shield, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const roles = [
    { 
      id: "student", 
      label: "Student", 
      icon: GraduationCap, 
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      ring: "ring-blue-500"
    },
    { 
      id: "faculty", 
      label: "Faculty", 
      icon: Users, 
      gradient: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50",
      ring: "ring-emerald-500"
    },
    { 
      id: "admin", 
      label: "Admin", 
      icon: Shield, 
      gradient: "from-purple-500 to-purple-600",
      lightBg: "bg-purple-50",
      ring: "ring-purple-500"
    },
  ];

  const currentRole = roles.find(r => r.id === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Validate role matches credentials
        if (data.user.role !== selectedRole) {
          setError(`Invalid credentials for ${selectedRole} role. Please select the correct role.`);
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Navigate based on role
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "faculty") {
          navigate("/faculty/dashboard");
        } else if (data.user.role === "student") {
          navigate("/student/dashboard");
        }
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-white">EduPort</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Welcome to<br />Smart Education<br />Management
          </h2>
          <p className="text-blue-100 text-lg">
            Streamline your academic experience with our comprehensive platform
          </p>
        </div>

        <div className="relative z-10 text-white/80 text-sm">
          <p>&copy; 2026 EduPort. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-3 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EduPort</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Welcome back, please login to continue
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`relative py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isSelected
                          ? "bg-white text-gray-900 shadow-md"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? "" : "opacity-60"}`} />
                      <span className="text-xs">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-semibold text-white shadow-lg transition-all transform hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6 bg-gradient-to-r ${currentRole.gradient} hover:shadow-xl`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {currentRole.label}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-xs text-gray-500 mt-6">
            &copy; 2026 EduPort. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}




