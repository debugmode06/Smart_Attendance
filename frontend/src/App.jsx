// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";

// Login
import Login from "./pages/Login";
import "leaflet/dist/leaflet.css";


// LAYOUTS
import StudentLayout from "./student/StudentLayout";
import FacultyLayout from "./faculty/FacultyLayout";
import AdminLayout from "./admin/AdminLayout";

// STUDENT PAGES
import StudentDashboard from "./student/pages/Dashboard";
import StudentSchedule from "./student/pages/Schedule";
import StudentAttendance from "./student/pages/Attendance";
import StudentAssignments from "./student/pages/Assignments";
import StudentAssessments from "./student/pages/Assessments";
import StudentPerformance from "./student/pages/Performance";
import LeaveOD from "./student/pages/LeaveOD";
import StudentCommunication from "./student/pages/Communication";
import StudentAiAssistant from "./student/pages/AiAssistant";
import StudentFeedback from "./student/pages/Feedback";
import Suggestions from "./student/pages/Suggestions";
import StudentProfile from "./student/pages/Profile";
import StudyMaterial from "./student/pages/StudyMaterial";
import AttemptAssessment from "./student/pages/AttemptAssessment";
import MarkAttendance from "./student/pages/MarkAttendance";


// FACULTY PAGES
import FacultyDashboard from "./faculty/pages/Dashboard";
import Students from "./faculty/pages/Students";
import FacultyTimetable from "./faculty/pages/TimetableNew";
import FacultyAttendance from "./faculty/pages/Attendance";
import FacultyAssignments from "./faculty/pages/Assignments";
import FacultySyllabus from "./faculty/pages/Syllabus";
import FacultyAssessments from "./faculty/pages/Assessments";
import Topics from "./faculty/pages/Topics";
import AiAssistantFaculty from "./faculty/pages/AiAssistant";
import Behaviour from "./faculty/pages/Behaviour";
import FacultyPerformance from "./faculty/pages/Performance";
import CommunicationFaculty from "./faculty/pages/Communication";
import FacultyProfile from "./faculty/pages/Profile";
import AssignmentsAndAssessments from "./faculty/pages/AssignmentsAndAssessments.jsx";
import LeaveApproval from "./faculty/pages/LeaveApproval";
import AssessmentSubmissions from "./faculty/pages/AssessmentSubmissions";
import LiveAttendance from "./faculty/pages/LiveAttendance";






// ADMIN PAGES
import AdminDashboard from "./admin/pages/Dashboard";
import AdminStudents from "./admin/pages/ManageStudents";
import AdminFaculty from "./admin/pages/ManageFaculty";
import AdminClasses from "./admin/pages/ManageClasses";
import AdminTimetable from "./admin/pages/TimetableManager";
import AdminAttendance from "./admin/pages/AttendanceAnalytics";
import AdminAnnouncements from "./admin/pages/Announcements";
import AdminSettings from "./admin/pages/Settings";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.style.filter = "none";
    document.body.style.opacity = "1";
  }, []);

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <Routes>
      {/* Default -> Login */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* STUDENT */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="assessments" element={<StudentAssessments />} />
        <Route path="performance" element={<StudentPerformance />} />
        <Route path="leave" element={<LeaveOD />} />
        <Route path="communication" element={<StudentCommunication />} />
        <Route path="ai" element={<StudentAiAssistant />} />
        <Route path="feedback" element={<StudentFeedback />} />
        <Route path="suggestions" element={<Suggestions />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="study-material" element={<StudyMaterial />} />
        <Route path="/student/assessment/:id" element={<AttemptAssessment />} />
        <Route path="mark-attendance" element={<MarkAttendance />} />


      </Route>

      {/* FACULTY */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="timetable" element={<FacultyTimetable />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="syllabus" element={<FacultySyllabus />} />
        <Route path="assessments" element={<FacultyAssessments />} />
        <Route path="topics" element={<Topics />} />
        <Route path="ai" element={<AiAssistantFaculty />} />
        <Route path="behaviour" element={<Behaviour />} />
        <Route path="performance" element={<FacultyPerformance />} />
        <Route path="communication" element={<CommunicationFaculty />} />
         <Route path="profile" element={<FacultyProfile />} />
         <Route path="/faculty/tasks" element={<AssignmentsAndAssessments />} />
         <Route path="leave-od" element={<LeaveApproval />} />
        <Route path="/faculty/assessment/submissions" element={<AssessmentSubmissions />} />
        <Route
  path="/faculty/assessments/:assessmentId/submissions"
  element={<AssessmentSubmissions />}
/>
        <Route path="live-attendance" element={<LiveAttendance />} />



      </Route>

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="faculty" element={<AdminFaculty />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}



