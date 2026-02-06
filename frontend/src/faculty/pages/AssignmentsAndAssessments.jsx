import { useState } from "react";
import Assignments from "./Assignments.jsx";
import Assessments from "./Assessments.jsx";

export default function AssignmentsAndAssessments() {
  const [activeTab, setActiveTab] = useState("assignments");

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen rounded-2xl shadow-inner">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-700 text-transparent bg-clip-text">
          Assignments & Assessments
        </h1>
      </div>

      {/* Premium Tabs */}
      <div className="flex w-full border-b border-gray-300/50 mb-6">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-6 py-3 font-semibold text-sm rounded-t-lg transition-all duration-200 ${
            activeTab === "assignments"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Assignments
        </button>

        <button
          onClick={() => setActiveTab("assessments")}
          className={`px-6 py-3 font-semibold text-sm rounded-t-lg ml-2 transition-all duration-200 ${
            activeTab === "assessments"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Assessments
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-200">
        {activeTab === "assignments" ? <Assignments /> : <Assessments />}
      </div>
    </div>
  );
}

