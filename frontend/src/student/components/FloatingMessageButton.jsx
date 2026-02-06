import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Image, Mic, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingMessageButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can we help you today?", sender: "system", time: "10:00 AM" },
  ]);
  const messagesEndRef = useRef(null);

  // Handle scroll to show/hide button (optional, keeping original behavior usually good but iPhone style usually stays)
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop;
      if (scrolled > 300) {
        setIsVisible(true); // Changed to always visible or specific logic
      } else {
        setIsVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Thanks for your message! This is a demo chat interface.",
        sender: "system",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className={`fixed bottom-20 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>

      {/* iOS Style Chat Interface */}
      <div
        className={`origin-bottom-right transition-all duration-300 ease-out transform ${isOpen
          ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
          : "scale-90 opacity-0 translate-y-10 pointer-events-none"
          } w-[320px] max-w-[90vw] h-[500px] max-h-[70vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col font-sans mb-4`}
      >
        {/* Header - Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-gray-100 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-bold text-sm">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm">Support Bot</span>
              <span className="text-[10px] text-gray-500">iMessage</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-blue-500">
            {/* Icons removed as per request */}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-white p-4 overflow-y-auto space-y-3">

          <div className="text-center text-xs text-gray-400 my-4 font-medium">Today</div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.sender === "user"
                  ? "bg-[#007AFF] text-white rounded-br-none"
                  : "bg-[#E9E9EB] text-black rounded-bl-none"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input */}
        <div className="p-3 bg-white/90 backdrop-blur-sm border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Image size={24} />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="iMessage"
                className="w-full pl-4 pr-8 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-gray-400 focus:ring-0 placeholder-gray-400 transition-all"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <Mic size={16} />
              </button>
            </div>

            <button
              type="submit"
              disabled={!message.trim()}
              className={`p-2 rounded-full transition-all duration-200 ${message.trim()
                ? "bg-[#007AFF] text-white hover:bg-[#006BE0] active:scale-95"
                : "bg-gray-200 text-gray-400"
                }`}
            >
              <Send size={18} className={message.trim() ? "ml-0.5" : ""} />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`relative w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 z-50 pointer-events-auto ${isOpen ? "bg-gray-100 text-gray-600 rotate-90" : "bg-gradient-to-b from-[#34C759] to-[#30B753] text-white"
          }`}
        aria-label="Open messages"
        style={{
          boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.1)' : '0 8px 24px rgba(52, 199, 89, 0.4)'
        }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={30} fill="currentColor" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
};

export default FloatingMessageButton;