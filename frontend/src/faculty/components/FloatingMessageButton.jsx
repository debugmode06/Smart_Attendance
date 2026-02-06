import { useState } from "react";
import { MessageCircle } from "lucide-react";
import SendMessage from "../pages/SendMessage";

export default function FloatingMessageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Button - Clean Circle Design */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-24 right-6 z-40 group"
        style={{
          width: '60px',
          height: '60px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: '20px' // Extra space for mobile nav
        }}
      >
        {/* Main Circle */}
        <div className="relative w-full h-full">
          {/* Background Circle with Gradient */}
          <div 
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              boxShadow: isHovered 
                ? '0 12px 40px rgba(0, 122, 255, 0.4), 0 0 0 0 rgba(0, 122, 255, 0.3)'
                : '0 8px 24px rgba(0, 122, 255, 0.3)',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
          
          {/* Pulse Ring Animation */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: 'rgba(0, 122, 255, 0.3)',
              transform: 'scale(1.2)',
              opacity: 0.6
            }}
          />
          
          {/* Icon Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageCircle 
              className="transition-all duration-300" 
              style={{
                width: '26px',
                height: '26px',
                color: '#ffffff',
                transform: isHovered ? 'scale(1.1) rotate(-10deg)' : 'scale(1) rotate(0deg)',
              }}
            />
          </div>
          
          {/* Hover Label */}
          <div 
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div 
              className="px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              Send Message
            </div>
          </div>
        </div>
      </button>

      {/* Message Modal */}
      <SendMessage isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
