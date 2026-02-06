import { useState, useEffect } from "react";
import { Send, X, Users, MessageSquare, CheckCircle } from "lucide-react";
import api from "../../utils/axios";

export default function SendMessage({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const facultyName = user.name || "Faculty";

  // Class options - MUST match database className values exactly
  const classOptions = [
    "CSE A",
    "CSE B", 
    "CSE C",
    "CSE D",
    "IT A",
    "IT B",
    "ECE A",
    "ECE B",
    "MECH A",
    "MECH B",
    "CIVIL A",
    "CIVIL B"
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim() || !selectedClass) {
      alert("Please fill in all fields and select a class");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      console.log('=== SENDING MESSAGE ===');
      console.log('Selected Class:', selectedClass);
      console.log('Title:', title);
      console.log('Message:', message);
      console.log('Faculty Name:', facultyName);
      console.log('======================');

      // Send className field (matches database)
      const response = await api.post("/notifications/broadcast-to-class", {
        className: selectedClass, // Database uses className field
        title: title,
        message: message,
        facultyName: facultyName,
        type: "announcement"
      });

      console.log('✅ SUCCESS Response:', response.data);

      if (response.data.success) {
        setSuccess(true);
        setTitle("");
        setMessage("");
        setSelectedClass("");
        
        // Show success details
        const studentNames = response.data.students || [];
        const countMsg = `Message sent to ${response.data.count} student${response.data.count > 1 ? 's' : ''}`;
        console.log(countMsg, studentNames);
        
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ ERROR sending message:', error);
      
      // Extract detailed error information
      const errorData = error.response?.data;
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (errorData) {
        console.error('Error details:', errorData);
        
        // Show detailed error with available classes
        if (errorData.debug) {
          const debug = errorData.debug;
          errorMessage = errorData.message + '\n\n';
          
          if (debug.availableClasses && debug.availableClasses.length > 0) {
            errorMessage += 'Available classes: ' + debug.availableClasses.join(', ');
          }
          
          errorMessage += '\n\nTotal students in database: ' + debug.totalStudents;
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Send Message</h2>
              <p className="text-xs sm:text-sm text-blue-100">Notify students in a specific class</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">Message sent successfully to {selectedClass}!</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSendMessage} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base bg-white"
              required
            >
              <option value="">Choose a class...</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Message will be sent to all students in the selected class
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              placeholder="e.g., Class Postponed, Important Notice..."
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base resize-none"
              placeholder="Type your message here..."
              rows={6}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">PREVIEW</p>
              {title && (
                <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
              )}
              {message && (
                <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-wrap">{message}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">From: {facultyName}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSendMessage}
            disabled={loading || !title || !message || !selectedClass}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
