import { useState, useEffect } from 'react';
import { Bell, X, Trash2 } from 'lucide-react';
import api from '../utils/axios';

export default function NotificationBell({ userId, onNotificationClick }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Poll for unread count every 5 seconds
  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get(`/notifications/unread/${userId}`);
        if (response.data.success) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 5 seconds
    const interval = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showDropdown && userId) {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/notifications/${userId}?limit=20`);
          if (response.data.success) {
            // Filter to show only unread notifications so clear all persists
            setNotifications(response.data.notifications.filter(n => !n.read));
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [showDropdown, userId]);

  const handleBellClick = () => {
    setShowDropdown(true);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await api.post(`/notifications/read/${notification._id}`);
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      }

      // Handle redirect based on notification type
      if (onNotificationClick) {
        onNotificationClick(notification);
      }

      setShowDropdown(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.post(`/notifications/read-all/${userId}`);
      setUnreadCount(0);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="relative">
        {/* Bell Icon */}
        <button
          onClick={handleBellClick}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
        >
          <Bell className="w-6 h-6" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Side Drawer Notification Panel */}
      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#f2f2f7] shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${showDropdown ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header - iOS Style */}
        <div className="px-5 pt-6 pb-4 bg-[#f2f2f7] border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold" style={{ color: '#000', letterSpacing: '-0.5px' }}>
              Notifications
            </h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}
            </span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Notifications List - iOS Cards */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 rounded-full animate-spin border-blue-500 border-t-transparent"></div>
              <p className="mt-3 text-sm text-gray-400">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-500">No Notifications</p>
              <p className="text-sm text-gray-400 mt-1">We'll let you know when updates arrive.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className="w-full text-left bg-white rounded-2xl p-4 shadow-sm transition-all duration-200 hover:scale-[0.98] active:scale-95 border border-gray-100/50 relative overflow-hidden group"
              >
                {!notification.read && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm ring-2 ring-white"></div>
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${notification.read ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-500'
                      }`}>
                      <Bell size={22} className={notification.read ? 'text-gray-400' : 'text-blue-500'} fill="currentColor" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-[15px] font-semibold mb-1 leading-snug ${notification.read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                      {notification.title}
                    </p>
                    <p className="text-[13px] text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400">
                      {getTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
