import { useState } from "react";

export default function TopicsAndCurriculum() {
  const [topics, setTopics] = useState([
    {
      no: 1,
      periods: 1,
      topic: "Introduction to Web, HTTP Protocol – Request & Response",
      example:
        "Real-life Ex: Understanding how browsers fetch data from websites (e.g., visiting Amazon.com).",
      teaching: "PPT & Mind Mapping",
      status: false,
    },
    {
      no: 2,
      periods: 1,
      topic: "Web Browser & Web Server – Roles and Communication",
      example:
        "Real-life Ex: How a Chrome browser talks to Google servers to render a search result.",
      teaching: "Network Diagram & Whiteboard Explanation",
      status: false,
    },
    {
      no: 3,
      periods: 1,
      topic:
        "Concepts of Effective Web Design – UI/UX principles, Layouts",
      example:
        "Real-life Ex: Comparing Apple.com (good design) vs cluttered sites.",
      teaching: "Case Study & Video Walkthrough",
      status: false,
    },
    {
      no: 4,
      periods: 1,
      topic:
        "Page Linking and Navigation Design – Internal, External, Anchor, Menus",
      example:
        "Real-life Ex: Navigation bar in e-commerce site to switch between Home, Products, Cart, etc.",
      teaching: "Code Lab & Hands-on Practice",
      status: false,
    },
    {
      no: 5,
      periods: 1,
      topic:
        "Planning and publishing a website – Hosting, Domains, Tools",
      example:
        "Real-life Ex: Deploying a portfolio site using GitHub Pages or custom hosting.",
      teaching: "Infographic Poster & Interactive Demo",
      status: false,
    },
    {
      no: 6,
      periods: 2,
      topic:
        "Basics of HTML: Structure, Tags, Forms, Media, Semantic Elements",
      example:
        "Real-life Ex: Creating resume web pages with images, videos, and contact form.",
      teaching: "VS Code & Worksheet Activity",
      status: false,
    },
    {
      no: 7,
      periods: 1,
      topic:
        "HTML Features – Accessibility, SEO Optimization",
      example:
        "Real-life Ex: Making a site readable for screen readers and rank higher in Google search.",
      teaching: "Lighthouse Tool & Checklist Roleplay",
      status: false,
    },
    {
      no: 8,
      periods: 2,
      topic:
        "Introduction to CSS – Syntax, Selectors, Color, Text, Box Model, Layouts (Flex, Grid)",
      example:
        "Real-life Ex: Styling responsive blog layouts or online store product cards.",
      teaching: "Pair Programming & Styling Practice",
      status: false,
    },
  ]);

  const toggleStatus = (index) => {
    const updated = [...topics];
    updated[index].status = !updated[index].status;
    setTopics(updated);
  };

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Topics & Curriculum</h2>
              <p className="text-slate-300 text-sm mt-1">Manage course topics and track completion status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Header Box */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200">
          <div className="border-r border-slate-200 p-5 font-semibold text-lg text-slate-800 bg-gradient-to-r from-slate-50 to-white">
            UNIT I: INTRODUCTION TO WEB DESIGN, HTML AND CSS
          </div>
          <div className="p-5 font-semibold text-lg text-right text-slate-800 bg-gradient-to-r from-white to-slate-50">
            Target Hours: 10
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                <th className="border-2 border-slate-300 p-4 font-semibold text-slate-700">S.No</th>
                <th className="border-2 border-slate-300 border-l-0 p-4 font-semibold text-slate-700">No. of Periods</th>
                <th className="border-2 border-slate-300 border-l-0 p-4 font-semibold text-slate-700">Name of the Topic</th>
                <th className="border-2 border-slate-300 border-l-0 p-4 font-semibold text-slate-700">Teaching Aids & Methods</th>
                <th className="border-2 border-slate-300 border-l-0 p-4 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>

            <tbody>
              {topics.map((t, i) => (
                <tr
                  key={i}
                  className={`border-2 border-slate-300 border-t-0 hover:bg-slate-50/50 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <td className="border-r-2 border-slate-300 p-4 font-medium text-slate-800">{t.no}</td>
                  <td className="border-r-2 border-slate-300 p-4 text-slate-600">{t.periods}</td>

                  <td className="border-r-2 border-slate-300 p-4">
                    <p className="font-semibold text-slate-800 mb-1">{t.topic}</p>
                    <p className="text-sm text-slate-500">{t.example}</p>
                  </td>

                  <td className="border-r-2 border-slate-300 p-4 text-sm text-slate-600">
                    {t.teaching}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(i)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        t.status
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                          : "bg-red-600 hover:bg-red-700 text-white shadow-md"
                      }`}
                    >
                      {t.status ? "Completed" : "Not Completed"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

