import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function Schedule() {
  const [periods, setPeriods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch timetable when selectedDate changes
  useEffect(() => {
    const fetchTimetable = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      // Get day name from selectedDate
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = dayNames[selectedDate.getDay()];

      console.log("[Schedule] Fetching timetable for:", dayName);
      console.log("[Schedule] Selected date:", selectedDate);

      setLoading(true);

      try {
        const response = await fetch(
          `https://smart-face-attendance-mfkt.onrender.com/api/student/timetable/day?day=${dayName}`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        const data = await response.json();
        console.log("[Schedule] Data received:", data);
        console.log("[Schedule] Periods array:", data.periods);
        console.log("[Schedule] Periods length:", data.periods?.length || 0);

        setPeriods(data.periods || []);
      } catch (error) {
        console.error("[Schedule] Error fetching:", error);
        setPeriods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedDate]); // Re-fetch when selectedDate changes

  const getCurrentPeriod = () => {
    // Only highlight current period if viewing today's schedule
    const today = new Date();
    const isViewingToday = 
      selectedDate.getDate() === today.getDate() && 
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();
    
    if (!isViewingToday) {
      return -1; // No current period if not viewing today
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return periods.findIndex((p) => {
      const [sH, sM] = p.start.split(":").map(Number);
      const [eH, eM] = p.end.split(":").map(Number);
      const startMinutes = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;

      return currentTime >= startMinutes && currentTime <= endMinutes;
    });
  };

  const currentPeriodIndex = getCurrentPeriod();

  // Generate 6 weekdays (Mon-Sat)
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Find Monday of current week
    const monday = new Date(today);
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days
    monday.setDate(today.getDate() + diff);
    
    // Get Mon-Sat (6 days)
    for (let i = 0; i < 6; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <div className="min-h-screen bg-[#EEF2F1] p-4 sm:p-6 -m-4 sm:-m-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#111827]">
          My schedule
        </h1>
        
        {/* Week Days Selector */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weekDays.map((day, idx) => {
            const selected = isSelected(day);
            const today = isToday(day);
            
            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`flex-1 min-w-[50px] h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                  selected 
                    ? 'bg-[#1F7F6B]' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <span className={`text-[11px] ${
                  selected ? 'text-white/70' : 'text-[#6B7280]'
                }`}>
                  {dayNames[idx]}
                </span>
                <span className={`text-sm font-semibold ${
                  selected ? 'text-white' : today ? 'text-[#1F7F6B]' : 'text-[#111827]'
                }`}>
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F7F6B]"></div>
          </div>
        ) : periods.length === 0 ? (
          <div className="bg-white rounded-[18px] p-8 text-center shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">No Classes Today</h3>
            <p className="text-[11px] text-[#6B7280]">There are no scheduled classes for this day.</p>
          </div>
        ) : (
          periods.map((period, idx) => {
          const isCurrent = idx === currentPeriodIndex;
          const isPast = idx < currentPeriodIndex;
          
          const getDotColor = () => {
            if (isCurrent) return "bg-[#22C55E]";
            return "bg-[#6366F1]";
          };

          const getCardBackground = () => {
            if (isCurrent) return "bg-[#A7F3D0]";
            if (isPast) return "bg-white opacity-60";
            return "bg-white";
          };
          
          return (
            <div key={idx} className="flex items-start gap-0">
              {/* Time Column (64px) */}
              <div className="w-16 flex flex-col items-end pr-3 pt-4">
                <span className="text-xs font-semibold text-[#111827]">
                  {period.start}
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  {period.end}
                </span>
              </div>
              
              {/* Timeline Indicator (24px) */}
              <div className="w-6 flex flex-col items-center relative">
                {/* Vertical Line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-[#D1D5DB]" />
                
                {/* Event Dot */}
                <div className={`w-2.5 h-2.5 rounded-full ${getDotColor()} relative z-10 mt-5`} />
              </div>
              
              {/* Event Card */}
              <div className="flex-1 pb-5">
                <div className={`${getCardBackground()} rounded-[18px] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex flex-col gap-2`}>
                  {/* Subject Title with Now Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {period.subjectCode && (
                        <span className="text-[10px] font-medium text-[#6B7280] mb-0.5">
                          {period.subjectCode}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-[#111827]">
                        {period.subject}
                      </h3>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-white bg-[#22C55E] px-2.5 py-1.5 rounded-full">
                        Now
                      </span>
                    )}
                  </div>
                  
                  {/* Room Info */}
                  <p className="text-[11px] text-[#6B7280]">
                    {period.isFreePeriod ? 'Free Period' : `B${idx + 3}, Room ${120 + idx * 4}`}
                  </p>
                  
                  {/* Teacher Row */}
                  {!period.isFreePeriod && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(period.facultyName || 'Teacher')}&background=random`}
                          alt={period.facultyName || 'Teacher'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] text-[#6B7280]">
                        {period.facultyName || 'Teacher'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}


