import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

export default function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);

  const icons = [
    { Icon: GraduationCap, label: "Loading Education" },
    { Icon: BookOpen, label: "Preparing Content" },
    { Icon: Users, label: "Connecting Users" },
    { Icon: Award, label: "Almost Ready" },
  ];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onLoadComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Icon rotation
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(iconInterval);
    };
  }, [onLoadComplete]);

  const { Icon, label } = icons[currentIcon];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo and Icon Animation */}
        <div className="mb-8 relative">
          <div className="inline-block relative">
            {/* Rotating rings */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="w-32 h-32 border-4 border-white/20 border-t-white rounded-full"></div>
            </div>
            <div className="absolute inset-2 animate-spin-reverse">
              <div className="w-28 h-28 border-4 border-white/10 border-b-white/50 rounded-full"></div>
            </div>
            
            {/* Center icon */}
            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl transform transition-transform duration-500">
              <Icon className="w-16 h-16 text-indigo-600 animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
          EduPort
        </h1>
        <p className="text-xl text-white/90 mb-8 animate-fade-in-delay">
          {label}
        </p>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-white via-blue-200 to-white rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/80 text-sm mt-3 font-medium">
            {progress}% Complete
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-delay {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          50% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 4s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
