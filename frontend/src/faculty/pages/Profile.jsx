// src/faculty/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ResumeTemplate from "../components/ResumeTemplate";

// ---------------- INITIAL STATE ----------------
const initialFacultyDetails = {
  personalDetails: {
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    country: "",
    state: "",
    university: "",
    profileImage: "",
  },
  education: {
    highestQualification: "",
    specialization: "",
    certificateLink: "",
  },
  experience: {
    currentPosition: "",
    yearsOfExperience: "",
    pastRoles: "",
  },
  publications: {
    orcid: "",
    scholarId: "",
    scopusId: "",
    researchGate: "",
  },
  roles: {
    adminRoles: "",
    responsibilities: "",
  },
  achievements: {
    awards: "",
    fundedProjects: "",
    certifications: "",
  },
};

export default function FacultyProfile() {
  const tabs = [
    "Personal Details",
    "Bio / Education",
    "Experience",
    "Publications",
    "Current Roles",
    "Achievements",
  ];

  const [activeTab, setActiveTab] = useState("Personal Details");
  const [facultyDetails, setFacultyDetails] = useState(initialFacultyDetails);

  const [resume, setResume] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const facultyId = localStorage.getItem("facultyId");
  const resumeRef = useRef(null);

  // -------- CLEANING FUNCTION TO REMOVE UGLY AI TEXT --------
  const cleanResumeText = (text) => {
    if (!text) return "";

    return text
      .replace(/```json[\s\S]*?```/g, "")     // remove codeblock json
      .replace(/\{[\s\S]*?\}/g, "")           // remove any json object
      .replace(/Here is[\s\S]*?:/gi, "")      // remove "Here is a Premium resume..."
      .replace(/PREMIUM\+ RESUME RULES[\s\S]*/gi, "") // remove rule section
      .replace(/provided information/gi, "")
      .replace(/====[\s\S]*/g, "")            // remove separators / system text
      .trim();
  };

  // ---------- Update Field ----------
  const updateField = (section, field, value) => {
    setFacultyDetails((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // ---------- Load Profile ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!facultyId) return setLoadingProfile(false);

        const res = await axios.get(
          `https://smart-face-attendance-mfkt.onrender.com/api/faculty/profile/${facultyId}`
        );

        const savedProfile = res.data || {};
        const user = JSON.parse(localStorage.getItem("user"));

        const merged = {
          personalDetails: {
            fullName:
              savedProfile.personalDetails?.fullName || user?.name || "",
            email: savedProfile.personalDetails?.email || user?.email || "",
            phone: savedProfile.personalDetails?.phone || "",
            gender: savedProfile.personalDetails?.gender || "",
            dob: savedProfile.personalDetails?.dob || "",
            country: savedProfile.personalDetails?.country || "",
            state: savedProfile.personalDetails?.state || "",
            university: savedProfile.personalDetails?.university || "",
            profileImage: savedProfile.personalDetails?.profileImage || "",
          },
          education: savedProfile.education || initialFacultyDetails.education,
          experience:
            savedProfile.experience || initialFacultyDetails.experience,
          publications:
            savedProfile.publications || initialFacultyDetails.publications,
          roles: savedProfile.roles || initialFacultyDetails.roles,
          achievements:
            savedProfile.achievements || initialFacultyDetails.achievements,
        };

        setFacultyDetails(merged);
      } catch {}
      finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [facultyId]);

  // ---------- Save Profile ----------
  const saveProfile = async () => {
    try {
      setSaving(true);

      await axios.post("https://smart-face-attendance-mfkt.onrender.com/api/faculty/profile/save", {
        facultyId,
        data: facultyDetails,
      });

      alert("Profile saved!");
    } catch {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Generate Resume ----------
  const generateResume = async () => {
    try {
      setLoadingResume(true);

      const res = await axios.post(
        "https://smart-face-attendance-mfkt.onrender.com/api/resume/generate",
        { facultyId, ...facultyDetails }
      );

      setResume(cleanResumeText(res.data.resume)); // CLEAN AI RESPONSE
    } catch {
      alert("Failed to generate resume");
    } finally {
      setLoadingResume(false);
    }
  };

  // ---------- PDF Export ----------
  const downloadDesignedPDF = async () => {
    try {
      const canvas = await html2canvas(resumeRef.current, { scale: 2 });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(img, "PNG", 0, 0, width, height);
      pdf.save("faculty_resume.pdf");
    } catch {
      alert("PDF export failed");
    }
  };

  if (loadingProfile)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading profile...
      </div>
    );

  // ----------------------------------------------------
  // UI — FULL PAGE FORM (NO PREVIEW)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Faculty Profile</h1>

          <button
            onClick={saveProfile}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* FULL WIDTH FORM */}
        <div className="bg-white rounded-2xl shadow-xl p-6">

          <div className="flex space-x-3 border-b pb-3 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-md ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "Personal Details" && (
              <PersonalDetails data={facultyDetails.personalDetails} updateField={updateField} />
            )}

            {activeTab === "Bio / Education" && (
              <Education data={facultyDetails.education} updateField={updateField} />
            )}

            {activeTab === "Experience" && (
              <Experience data={facultyDetails.experience} updateField={updateField} />
            )}

            {activeTab === "Publications" && (
              <Publications data={facultyDetails.publications} updateField={updateField} />
            )}

            {activeTab === "Current Roles" && (
              <Roles data={facultyDetails.roles} updateField={updateField} />
            )}

            {activeTab === "Achievements" && (
              <Achievements data={facultyDetails.achievements} updateField={updateField} />
            )}
          </div>
        </div>

        {/* BUTTON TO OPEN POPUP */}
        <button
          onClick={async () => {
            setShowModal(true);      // Popup opens instantly
            setLoadingResume(true);  // Show loading inside popup
            setResume("");           // Clear old
            await generateResume();  // Generate new resume
          }}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl text-lg"
        >
          Generate Resume Preview
        </button>
      </div>

      {/* -------------------------------------------------- */}
      {/*                MODAL POPUP                         */}
      {/* -------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>

            {/* LOADING */}
            {loadingResume && (
              <div className="text-center py-10 text-lg font-semibold text-gray-600">
                🔄 Generating resume… Please wait
              </div>
            )}

            {/* CLEAN RESUME PREVIEW ONLY */}
            {!loadingResume && (
              <>
                <div className="border rounded-lg bg-slate-50 p-4 max-h-[60vh] overflow-y-auto">
                  <div ref={resumeRef}>
                    <ResumeTemplate
                      facultyDetails={facultyDetails}
                      resume={resume}
                    />
                  </div>
                </div>

                <button
                  onClick={downloadDesignedPDF}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
                >
                  Download PDF
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

/* ---------------- INPUT ---------------- */
function Input({ label, type = "text", value, onChange, textarea = false }) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          className="mt-1 w-full border rounded-xl p-3"
          value={value || ""}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          className="mt-1 w-full border rounded-xl p-3"
          value={value || ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}

/* ---------------- FORM SECTIONS ---------------- */
function PersonalDetails({ data, updateField }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Full Name" value={data.fullName} onChange={(e) => updateField("personalDetails", "fullName", e.target.value)} />
      <Input label="Email" value={data.email} onChange={(e) => updateField("personalDetails", "email", e.target.value)} />
      <Input label="Phone" value={data.phone} onChange={(e) => updateField("personalDetails", "phone", e.target.value)} />
      <Input label="Gender" value={data.gender} onChange={(e) => updateField("personalDetails", "gender", e.target.value)} />
      <Input label="Date of Birth" type="date" value={data.dob} onChange={(e) => updateField("personalDetails", "dob", e.target.value)} />
      <Input label="Country" value={data.country} onChange={(e) => updateField("personalDetails", "country", e.target.value)} />
      <Input label="State" value={data.state} onChange={(e) => updateField("personalDetails", "state", e.target.value)} />
      <Input label="University" value={data.university} onChange={(e) => updateField("personalDetails", "university", e.target.value)} />
      <Input label="Profile Image URL" value={data.profileImage} onChange={(e) => updateField("personalDetails", "profileImage", e.target.value)} />
    </div>
  );
}

function Education({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Highest Qualification" value={data.highestQualification} onChange={(e) => updateField("education", "highestQualification", e.target.value)} />
      <Input label="Specialization" value={data.specialization} onChange={(e) => updateField("education", "specialization", e.target.value)} />
      <Input label="Certificate Link" value={data.certificateLink} onChange={(e) => updateField("education", "certificateLink", e.target.value)} />
    </div>
  );
}

function Experience({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Current Position" value={data.currentPosition} onChange={(e) => updateField("experience", "currentPosition", e.target.value)} />
      <Input label="Years of Experience" type="number" value={data.yearsOfExperience} onChange={(e) => updateField("experience", "yearsOfExperience", e.target.value)} />
      <Input label="Past Roles" textarea value={data.pastRoles} onChange={(e) => updateField("experience", "pastRoles", e.target.value)} />
    </div>
  );
}

function Publications({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="ORCID" value={data.orcid} onChange={(e) => updateField("publications", "orcid", e.target.value)} />
      <Input label="Google Scholar ID" value={data.scholarId} onChange={(e) => updateField("publications", "scholarId", e.target.value)} />
      <Input label="Scopus ID" value={data.scopusId} onChange={(e) => updateField("publications", "scopusId", e.target.value)} />
      <Input label="ResearchGate" value={data.researchGate} onChange={(e) => updateField("publications", "researchGate", e.target.value)} />
    </div>
  );
}

function Roles({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Administrative Roles" textarea value={data.adminRoles} onChange={(e) => updateField("roles", "adminRoles", e.target.value)} />
      <Input label="Responsibilities" textarea value={data.responsibilities} onChange={(e) => updateField("roles", "responsibilities", e.target.value)} />
    </div>
  );
}

function Achievements({ data, updateField }) {
  return (
    <div className="space-y-4">
      <Input label="Awards" textarea value={data.awards} onChange={(e) => updateField("achievements", "awards", e.target.value)} />
      <Input label="Funded Projects" textarea value={data.fundedProjects} onChange={(e) => updateField("achievements", "fundedProjects", e.target.value)} />
      <Input label="Certifications" textarea value={data.certifications} onChange={(e) => updateField("achievements", "certifications", e.target.value)} />
    </div>
  );
}



