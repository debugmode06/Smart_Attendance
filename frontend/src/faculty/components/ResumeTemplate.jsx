// src/faculty/components/ResumeTemplate.jsx
import React, { forwardRef } from "react";

const ResumeTemplate = forwardRef(({ facultyDetails, resume }, ref) => {
  const p = facultyDetails.personalDetails || {};
  const edu = facultyDetails.education || {};
  const exp = facultyDetails.experience || {};
  const pubs = facultyDetails.publications || {};
  const roles = facultyDetails.roles || {};
  const ach = facultyDetails.achievements || {};

  return (
    <div
      ref={ref}
      className="w-[800px] bg-white text-gray-900 mx-auto shadow-xl border"
    >
      {/* TOP HEADER */}
      <div className="bg-slate-900 text-white px-8 py-6">
        <h1 className="text-3xl font-bold tracking-wide">
          {p.fullName || "Faculty Name"}
        </h1>
        <p className="mt-1 text-sm uppercase tracking-[0.15em] text-slate-200">
          {exp.currentPosition ||
            `${facultyDetails?.subject || ""} Faculty`.trim() ||
            "Assistant Professor"}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-200">
          {p.email && <span>Email: {p.email}</span>}
          {p.phone && <span>Phone: {p.phone}</span>}
          {p.country && <span>{p.country}</span>}
          {p.state && <span>{p.state}</span>}
        </div>
      </div>

      {/* BODY: TWO COLUMNS */}
      <div className="grid grid-cols-3 gap-0">
        {/* LEFT COLUMN */}
        <div className="col-span-1 border-r border-slate-200 px-6 py-6 text-sm space-y-5">
          {/* SUMMARY (short) */}
          <section>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500 mb-2">
              SUMMARY
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">
              {resume
                ? resume.split("\n").slice(0, 4).join(" ")
                : "Dedicated and student-focused faculty member committed to delivering outcome-based education, mentoring learners and contributing to institutional growth through research, innovative teaching and academic leadership."}
            </p>
          </section>

          {/* CORE INFO */}
          <section>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500 mb-2">
              EDUCATION
            </h2>
            {edu.highestQualification || edu.specialization ? (
              <ul className="text-xs space-y-1">
                <li className="font-semibold">
                  {edu.highestQualification || "Highest Qualification"}
                </li>
                {(edu.specialization || edu.certificateLink) && (
                  <li>
                    {edu.specialization && <span>{edu.specialization}</span>}
                    {edu.certificateLink && (
                      <span className="block text-[11px] text-slate-500">
                        {edu.certificateLink}
                      </span>
                    )}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                Add your qualification & specialization in the profile.
              </p>
            )}
          </section>

          {/* QUICK SKILLS (auto-derived from data) */}
          <section>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500 mb-2">
              CORE SKILLS
            </h2>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Curriculum & Lesson Planning</li>
              <li>Outcome-Based Education (OBE)</li>
              <li>Research & Publications</li>
              <li>Student Mentorship</li>
              <li>Classroom Management</li>
              <li>Academic Coordination</li>
            </ul>
          </section>

          {/* PUBLICATION IDS */}
          {(pubs.orcid ||
            pubs.scholarId ||
            pubs.scopusId ||
            pubs.researchGate) && (
            <section>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500 mb-2">
                RESEARCH PROFILES
              </h2>
              <ul className="text-[11px] space-y-1 text-slate-700">
                {pubs.orcid && <li>ORCID: {pubs.orcid}</li>}
                {pubs.scholarId && <li>Google Scholar: {pubs.scholarId}</li>}
                {pubs.scopusId && <li>Scopus ID: {pubs.scopusId}</li>}
                {pubs.researchGate && (
                  <li>ResearchGate: {pubs.researchGate}</li>
                )}
              </ul>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-2 px-8 py-6 text-sm space-y-5">
          {/* FULL AI SUMMARY + BODY */}
          <section>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500 mb-2">
              PROFESSIONAL PROFILE
            </h2>
            {resume ? (
              <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-slate-800">
                {resume}
              </pre>
            ) : (
              <p className="text-xs text-slate-600">
                Generate the AI resume from your profile to see full content
                here.
              </p>
            )}
          </section>

          {/* ROLES & RESPONSIBILITIES */}
          {(roles.adminRoles || roles.responsibilities) && (
            <section>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500 mb-2">
                ROLES & RESPONSIBILITIES
              </h2>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {roles.adminRoles && <li>{roles.adminRoles}</li>}
                {roles.responsibilities && <li>{roles.responsibilities}</li>}
              </ul>
            </section>
          )}

          {/* ACHIEVEMENTS */}
          {(ach.awards || ach.fundedProjects || ach.certifications) && (
            <section>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500 mb-2">
                KEY ACHIEVEMENTS
              </h2>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {ach.awards && <li>{ach.awards}</li>}
                {ach.fundedProjects && <li>{ach.fundedProjects}</li>}
                {ach.certifications && <li>{ach.certifications}</li>}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
});

export default ResumeTemplate;

