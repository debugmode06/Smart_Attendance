import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeTemplate from "../components/ResumeTemplate";

// ----------------------------------------
// INITIAL STATE
// ----------------------------------------
const initialStudentDetails = {
  personalDetails: {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    profileImage: "",
  },

  academic: {
    course: "",
    department: "",
    year: "",
    cgpa: "",
    backlogs: "",
    university: "",
    tenthSchool: "",
    tenthPercentage: "",
    tenthYear: "",
    twelfthSchool: "",
    twelfthPercentage: "",
    twelfthYear: "",
  },

  internships: [
    {
      company: "",
      role: "",
      duration: "",
      description: "",
    },
  ],

  projects: [
    {
      title: "",
      techStack: "",
      description: "",
      link: "",
    },
  ],

  skills: [],
  certifications: [{ name: "", issuer: "", year: "" }],
  achievements: [],
};

export default function StudentProfile() {
  const tabs = [
    "Personal Details",
    "Academic Info",
    "Internships",
    "Projects",
    "Skills",
    "Certifications",
    "Achievements",
  ];

  const [activeTab, setActiveTab] = useState("Personal Details");
  const [studentDetails, setStudentDetails] = useState(initialStudentDetails);

  const [resume, setResume] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const studentId = localStorage.getItem("studentId");
  const resumeRef = useRef(null);

  // ------------------ MODALS -------------------
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false); // Resume preview popup

  const [skillInput, setSkillInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  // ---------- CLEAN AI TEXT ----------
  const cleanResumeText = (text) => {
    if (!text) return "";

    return text
      .replace(/```json[\s\S]*?```/g, "") // remove ```json blocks
      .replace(/\{[\s\S]*?\}/g, "") // remove raw JSON objects
      .replace(/Here is[\s\S]*?:/gi, "") // remove "Here is a Premium+ resume..." etc
      .replace(/PREMIUM\+ RESUME RULES[\s\S]*/gi, "") // remove rules/instructions
      .replace(/provided information/gi, "")
      .replace(/====[\s\S]*/g, "") // remove separators / trailing junk
      .trim();
  };

  const addSkill = () => {
    if (skillInput.trim() === "") return;
    setStudentDetails((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));
    setSkillInput("");
    setShowSkillModal(false);
  };

  const addAchievement = () => {
    if (achievementInput.trim() === "") return;
    setStudentDetails((prev) => ({
      ...prev,
      achievements: [...prev.achievements, achievementInput.trim()],
    }));
    setAchievementInput("");
    setShowAchievementModal(false);
  };

  // ----------------------------------------
  // FETCH PROFILE
  // ----------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!studentId) {
          console.warn("No studentId found");
          setLoadingProfile(false);
          return;
        }

        const res = await axios.get(
          `https://smart-face-attendance-mfkt.onrender.com/api/student/profile/${studentId}`
        );

        const savedProfile = res.data || {};
        const user = JSON.parse(localStorage.getItem("user"));

        const merged = {
          personalDetails: {
            fullName:
              savedProfile.personalDetails?.fullName || user?.name || "",
            email: savedProfile.personalDetails?.email || user?.email || "",
            phone: savedProfile.personalDetails?.phone || "",
            dob: savedProfile.personalDetails?.dob || "",
            gender: savedProfile.personalDetails?.gender || "",
            address: savedProfile.personalDetails?.address || "",
            profileImage: savedProfile.personalDetails?.profileImage || "",
          },

          academic: savedProfile.academic || initialStudentDetails.academic,
          internships:
            savedProfile.internships || initialStudentDetails.internships,
          projects: savedProfile.projects || initialStudentDetails.projects,
          skills: savedProfile.skills || [],
          certifications:
            savedProfile.certifications ||
            initialStudentDetails.certifications,
          achievements: savedProfile.achievements || [],
        };

        setStudentDetails(merged);
      } catch (err) {
        console.error("Failed loading student profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [studentId]);

  // ----------------------------------------
  // SAVE PROFILE
  // ----------------------------------------
  const saveProfile = async () => {
    try {
      if (!studentId) {
        alert("studentId missing in localStorage");
        return;
      }

      setSaving(true);

      await axios.post("https://smart-face-attendance-mfkt.onrender.com/api/student/profile/save", {
        studentId,
        data: studentDetails,
      });

      alert("Student profile saved!");
    } catch (err) {
      console.error("Error saving", err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // GENERATE RESUME (keeps modal open, shows skeleton)
  // ----------------------------------------
  const generateResume = async () => {
    try {
      setLoadingResume(true);
      const res = await axios.post(
        "https://smart-face-attendance-mfkt.onrender.com/api/resume/generate",
        { studentId, ...studentDetails }
      );

      setResume(cleanResumeText(res.data.resume));
    } catch (err) {
      console.error("Resume generation failed", err);
      alert("AI Failed");
    } finally {
      setLoadingResume(false);
    }
  };

  // ----------------------------------------
  // PDF EXPORT
  // ----------------------------------------
  const downloadDesignedPDF = async () => {
    if (!resumeRef.current) {
      alert("Generate resume first!");
      return;
    }

    try {
      const canvas = await html2canvas(resumeRef.current, { scale: 2 });
      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(img, "PNG", 0, 0, width, height);
      pdf.save("student_resume.pdf");
    } catch (err) {
      console.error("PDF ERROR", err);
      alert("PDF export failed");
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading student profile...
      </div>
    );
  }

  // ----------------------------------------
  // MAIN UI
  // ----------------------------------------
  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Profile & Resume Builder</h1>
              <p className="text-slate-300 text-sm">Build your professional profile and generate AI-powered resumes</p>
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-4 sm:p-6 overflow-y-auto max-h-[78vh]">
          {/* TABS */}
          <div className="flex space-x-2 border-b-2 border-slate-200 pb-3 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-md text-sm font-semibold whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="mt-4">
            {activeTab === "Personal Details" && (
              <PersonalDetails
                data={studentDetails.personalDetails}
                updateField={(s, f, v) =>
                  setStudentDetails((prev) => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, [f]: v },
                  }))
                }
              />
            )}

            {activeTab === "Academic Info" && (
              <AcademicInfo
                data={studentDetails.academic}
                updateField={(section, field, value) =>
                  setStudentDetails((prev) => ({
                    ...prev,
                    academic: { ...prev.academic, [field]: value },
                  }))
                }
              />
            )}

            {activeTab === "Internships" && (
              <Internships
                data={studentDetails.internships}
                addItem={(section, item) =>
                  setStudentDetails((prev) => ({
                    ...prev,
                    internships: [...prev.internships, item],
                  }))
                }
                updateArrayField={(section, index, field, value) => {
                  const copy = [...studentDetails.internships];
                  copy[index][field] = value;
                  setStudentDetails((prev) => ({
                    ...prev,
                    internships: copy,
                  }));
                }}
              />
            )}

            {activeTab === "Projects" && (
              <Projects
                data={studentDetails.projects}
                addItem={(section, item) =>
                  setStudentDetails((prev) => ({
                    ...prev,
                    projects: [...prev.projects, item],
                  }))
                }
                updateArrayField={(section, index, field, value) => {
                  const copy = [...studentDetails.projects];
                  copy[index][field] = value;
                  setStudentDetails((prev) => ({
                    ...prev,
                    projects: copy,
                  }));
                }}
              />
            )}

            {activeTab === "Skills" && (
              <Skills
                data={studentDetails.skills}
                openModal={() => setShowSkillModal(true)}
              />
            )}

            {activeTab === "Certifications" && (
              <Certifications
                data={studentDetails.certifications}
                addItem={(section, item) =>
                  setStudentDetails((prev) => ({
                    ...prev,
                    certifications: [...prev.certifications, item],
                  }))
                }
                updateArrayField={(section, index, field, value) => {
                  const copy = [...studentDetails.certifications];
                  copy[index][field] = value;
                  setStudentDetails((prev) => ({
                    ...prev,
                    certifications: copy,
                  }));
                }}
              />
            )}

            {activeTab === "Achievements" && (
              <Achievements
                data={studentDetails.achievements}
                openModal={() => setShowAchievementModal(true)}
              />
            )}
          </div>
        </div>

        {/* BUTTON TO OPEN RESUME PREVIEW POPUP */}
        <button
          onClick={() => {
            setShowResumeModal(true); // show popup instantly
            setResume(""); // clear old resume
            generateResume(); // start AI call; skeleton will show
          }}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl text-lg font-semibold"
        >
          Generate Resume Preview
        </button>
      </div>

      {/* ===================== RESUME PREVIEW MODAL ===================== */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowResumeModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>

            {/* SKELETON WHILE LOADING */}
            {loadingResume && (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="flex gap-4">
                  <div className="h-24 flex-1 bg-gray-200 rounded"></div>
                  <div className="h-24 flex-1 bg-gray-200 rounded"></div>
                </div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            )}

            {/* DESIGNED RESUME ONLY WHEN READY */}
            {!loadingResume && (
              <>
                <div className="border rounded-lg bg-slate-50 p-4 max-h-[60vh] overflow-y-auto">
                  <div ref={resumeRef}>
                    <ResumeTemplate
                      studentDetails={studentDetails}
                      resume={resume}
                    />
                  </div>
                </div>

                <button
                  onClick={downloadDesignedPDF}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                >
                  Download PDF
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------------------- SKILL MODAL ---------------------- */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">Add Skill</h2>

            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Enter skill"
              className="w-full border rounded-xl p-3 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSkillModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addSkill}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- ACHIEVEMENT MODAL ---------------------- */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">Add Achievement</h2>

            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              placeholder="Enter achievement"
              className="w-full border rounded-xl p-3 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAchievementModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addAchievement}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- INPUT COMPONENT ---------------------------- */
function Input({ label, type = "text", value, onChange, textarea = false }) {
  return (
    <div>
      <label className="font-semibold text-gray-700">{label}</label>

      {textarea ? (
        <textarea
          className="mt-1 w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
          rows={3}
          placeholder={label}
          value={value || ""}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          className="mt-1 w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
          placeholder={label}
          value={value || ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}

/* ---------------------------- PERSONAL DETAILS TAB ---------------------------- */
function PersonalDetails({ data, updateField }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Full Name"
        value={data.fullName}
        onChange={(e) =>
          updateField("personalDetails", "fullName", e.target.value)
        }
      />

      <Input
        label="Email"
        value={data.email}
        onChange={(e) =>
          updateField("personalDetails", "email", e.target.value)
        }
      />

      <Input
        label="Phone"
        value={data.phone}
        onChange={(e) =>
          updateField("personalDetails", "phone", e.target.value)
        }
      />

      <Input
        label="Gender"
        value={data.gender}
        onChange={(e) =>
          updateField("personalDetails", "gender", e.target.value)
        }
      />

      <Input
        label="Date of Birth"
        type="date"
        value={data.dob}
        onChange={(e) =>
          updateField("personalDetails", "dob", e.target.value)
        }
      />

      <Input
        label="Address"
        textarea
        value={data.address}
        onChange={(e) =>
          updateField("personalDetails", "address", e.target.value)
        }
      />

      <Input
        label="Profile Image URL"
        value={data.profileImage}
        onChange={(e) =>
          updateField("personalDetails", "profileImage", e.target.value)
        }
      />
    </div>
  );
}

/* ---------------------------- ACADEMIC INFO TAB ---------------------------- */
function AcademicInfo({ data, updateField }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Course"
          value={data.course}
          onChange={(e) => updateField("academic", "course", e.target.value)}
        />

        <Input
          label="Department"
          value={data.department}
          onChange={(e) =>
            updateField("academic", "department", e.target.value)
          }
        />

        <Input
          label="Year"
          value={data.year}
          onChange={(e) => updateField("academic", "year", e.target.value)}
        />

        <Input
          label="CGPA"
          value={data.cgpa}
          type="number"
          onChange={(e) => updateField("academic", "cgpa", e.target.value)}
        />

        <Input
          label="Backlogs"
          type="number"
          value={data.backlogs}
          onChange={(e) => updateField("academic", "backlogs", e.target.value)}
        />

        <Input
          label="University"
          value={data.university}
          onChange={(e) =>
            updateField("academic", "university", e.target.value)
          }
        />
      </div>

      {/* 10th Details */}
      <h3 className="text-lg font-bold mt-6">10th Standard</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="School Name"
          value={data.tenthSchool}
          onChange={(e) =>
            updateField("academic", "tenthSchool", e.target.value)
          }
        />
        <Input
          label="Percentage"
          value={data.tenthPercentage}
          onChange={(e) =>
            updateField("academic", "tenthPercentage", e.target.value)
          }
        />
        <Input
          label="Passing Year"
          value={data.tenthYear}
          onChange={(e) =>
            updateField("academic", "tenthYear", e.target.value)
          }
        />
      </div>

      {/* 12th Details */}
      <h3 className="text-lg font-bold mt-6">12th Standard</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="School Name"
          value={data.twelfthSchool}
          onChange={(e) =>
            updateField("academic", "twelfthSchool", e.target.value)
          }
        />
        <Input
          label="Percentage"
          value={data.twelfthPercentage}
          onChange={(e) =>
            updateField("academic", "twelfthPercentage", e.target.value)
          }
        />
        <Input
          label="Passing Year"
          value={data.twelfthYear}
          onChange={(e) =>
            updateField("academic", "twelfthYear", e.target.value)
          }
        />
      </div>
    </div>
  );
}

/* ---------------------------- INTERNSHIPS TAB ---------------------------- */
function Internships({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">
      {data.map((item, index) => (
        <div key={index} className="border p-4 rounded-xl bg-gray-50 space-y-3">
          <Input
            label="Company"
            value={item.company}
            onChange={(e) =>
              updateArrayField("internships", index, "company", e.target.value)
            }
          />

          <Input
            label="Role"
            value={item.role}
            onChange={(e) =>
              updateArrayField("internships", index, "role", e.target.value)
            }
          />

          <Input
            label="Duration"
            value={item.duration}
            onChange={(e) =>
              updateArrayField("internships", index, "duration", e.target.value)
            }
          />

          <Input
            label="Description"
            textarea
            value={item.description}
            onChange={(e) =>
              updateArrayField(
                "internships",
                index,
                "description",
                e.target.value
              )
            }
          />
        </div>
      ))}

      <button
        onClick={() =>
          addItem("internships", {
            company: "",
            role: "",
            duration: "",
            description: "",
          })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Internship
      </button>
    </div>
  );
}

/* ---------------------------- PROJECTS TAB ---------------------------- */
function Projects({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">
      {data.map((proj, index) => (
        <div key={index} className="border p-4 rounded-xl bg-gray-50 space-y-3">
          <Input
            label="Project Title"
            value={proj.title}
            onChange={(e) =>
              updateArrayField("projects", index, "title", e.target.value)
            }
          />

          <Input
            label="Tech Stack"
            value={proj.techStack}
            onChange={(e) =>
              updateArrayField("projects", index, "techStack", e.target.value)
            }
          />

          <Input
            label="Description"
            textarea
            value={proj.description}
            onChange={(e) =>
              updateArrayField(
                "projects",
                index,
                "description",
                e.target.value
              )
            }
          />

          <Input
            label="Project Link (GitHub / Drive)"
            value={proj.link}
            onChange={(e) =>
              updateArrayField("projects", index, "link", e.target.value)
            }
          />
        </div>
      ))}

      <button
        onClick={() =>
          addItem("projects", {
            title: "",
            techStack: "",
            description: "",
            link: "",
          })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Project
      </button>
    </div>
  );
}

/* ---------------------------- SKILLS TAB (uses modal) ---------------------------- */
function Skills({ data, openModal }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {data.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Skill
      </button>
    </div>
  );
}

/* ---------------------------- CERTIFICATIONS TAB ---------------------------- */
function Certifications({ data, addItem, updateArrayField }) {
  return (
    <div className="space-y-6">
      {data.map((cert, index) => (
        <div key={index} className="border p-4 rounded-xl bg-gray-50 space-y-3">
          <Input
            label="Certificate Name"
            value={cert.name}
            onChange={(e) =>
              updateArrayField("certifications", index, "name", e.target.value)
            }
          />

          <Input
            label="Issued By"
            value={cert.issuer}
            onChange={(e) =>
              updateArrayField(
                "certifications",
                index,
                "issuer",
                e.target.value
              )
            }
          />

          <Input
            label="Year"
            value={cert.year}
            onChange={(e) =>
              updateArrayField("certifications", index, "year", e.target.value)
            }
          />
        </div>
      ))}

      <button
        onClick={() =>
          addItem("certifications", {
            name: "",
            issuer: "",
            year: "",
          })
        }
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Certification
      </button>
    </div>
  );
}

/* ---------------------------- ACHIEVEMENTS TAB (uses modal) ---------------------------- */
function Achievements({ data, openModal }) {
  return (
    <div className="space-y-3">
      <ul className="list-disc pl-5">
        {data.map((item, i) => (
          <li key={i} className="text-gray-700 text-sm">
            {item}
          </li>
        ))}
      </ul>

      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        + Add Achievement
      </button>
    </div>
  );
}


