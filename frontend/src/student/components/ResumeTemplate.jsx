import React, { forwardRef } from "react";

const ResumeTemplate = forwardRef(({ studentDetails, resume }, ref) => {
  const p = studentDetails.personalDetails || {};
  const a = studentDetails.academic || {};
  const internships = studentDetails.internships || [];
  const projects = studentDetails.projects || [];
  const skills = studentDetails.skills || [];
  const certs = studentDetails.certifications || [];
  const achievements = studentDetails.achievements || [];

  // Helper: join non-empty values with separator
  const join = (arr, sep = " | ") => arr.filter(Boolean).join(sep);

  return (
    <div
      ref={ref}
      className="w-[800px] bg-white text-black mx-auto border border-gray-300 shadow"
    >
      {/* HEADER */}
      <div className="px-8 pt-6 pb-3 border-b border-black">
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">
          {p.fullName || "STUDENT NAME"}
        </h1>

        {/* Contact + Links Row */}
        <div className="mt-3 text-xs leading-relaxed">
          <div>
            {join(
              [
                p.email && `✉ ${p.email}`,
                p.phone && `☎ ${p.phone}`,
                (p.address || a.university) &&
                  `📍 ${
                    p.address
                      ? p.address
                      : a.university
                      ? a.university
                      : ""
                  }`,
              ],
              "    "
            ) || "✉ email@example.com    ☎ +91-XXXXXXXXXX    📍 City, State"}
          </div>

          {/* You can plug LinkedIn/GitHub/Portfolio later */}
          {/* Example static placeholders for now */}
          <div>
            {join(
              [
                "in linkedin.com/in/your-profile",
                " github.com/your-id",
                " portfolio / profile link",
              ],
              "    "
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="px-8 py-4 text-[11px] leading-relaxed">
        {/* EDUCATION */}
        <SectionTitle title="Education" />
        <div className="ml-1 mb-2">
          <div className="flex justify-between font-semibold">
            <span>
              {a.course || "B.E. / B.Tech / B.Sc"}{" "}
              {a.department && `- ${a.department}`}
              {a.university && ` – ${a.university}`}
            </span>
            <span>
              {a.year || "Year – Present"}{" "}
              {p.address && `| ${p.address.split(",")[0]}`}
            </span>
          </div>
          {a.cgpa && (
            <div className="mt-0.5">Current CGPA : {a.cgpa}</div>
          )}
          {a.backlogs && Number(a.backlogs) > 0 && (
            <div className="mt-0.5">Backlogs : {a.backlogs}</div>
          )}
        </div>
        {/* 12th Standard */}
{(a.twelfthSchool || a.twelfthPercentage) && (
  <div className="ml-1 mb-3">
    <div className="font-semibold">
      12th – {a.twelfthSchool || "Higher Secondary School"}
    </div>
    <div>
      {a.twelfthPercentage && `Percentage: ${a.twelfthPercentage}`}
    </div>
    <div>{a.twelfthYear && `${a.twelfthYear}`}</div>
  </div>
)}

{/* 10th Standard */}
{(a.tenthSchool || a.tenthPercentage) && (
  <div className="ml-1 mb-3">
    <div className="font-semibold">
      10th – {a.tenthSchool || "Secondary School"}
    </div>
    <div>
      {a.tenthPercentage && `Percentage: ${a.tenthPercentage}`}
    </div>
    <div>{a.tenthYear && `${a.tenthYear}`}</div>
  </div>
)}

        {/* Optional AI Summary */}
        {resume && (
          <>
            <SectionTitle title="Professional Summary" />
            <p className="ml-1 mb-2 whitespace-pre-wrap">
              {resume.split("\n").slice(0, 6).join(" ")}
            </p>
          </>
        )}

        {/* TECHNICAL SKILLS */}
        <SectionTitle title="Technical Skills" />
        <div className="ml-1 mb-2">
          {skills && skills.length > 0 ? (
            <ul className="list-disc ml-4 space-y-0.5">
              {skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p>Add skills in the Skills tab to show them here.</p>
          )}
        </div>

        {/* EXPERIENCE (INTERNSHIPS) */}
        {internships && internships.length > 0 && (
          <>
            <SectionTitle title="Professional Experience / Internships" />
            <div className="ml-1 mb-2 space-y-2">
              {internships.map((intern, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-semibold">
                    <span>
                      {intern.role || "Intern"}{" "}
                      {intern.company && `– ${intern.company}`}
                    </span>
                    <span>{intern.duration || ""}</span>
                  </div>
                  {intern.description && (
                    <ul className="list-disc ml-4 mt-0.5">
                      <li>{intern.description}</li>
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROJECTS */}
        {projects && projects.length > 0 && (
          <>
            <SectionTitle title="Projects" />
            <div className="ml-1 mb-2 space-y-2">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-semibold">
                    <span>
                      {proj.title || "Project Title"}{" "}
                      {proj.link && (
                        <span className="underline font-normal">
                          – view project
                        </span>
                      )}
                    </span>
                  </div>

                  {proj.description && (
                    <ul className="list-disc ml-4 mt-0.5">
                      <li>{proj.description}</li>
                    </ul>
                  )}

                  {proj.techStack && (
                    <div className="ml-4 text-[10px] mt-0.5">
                      <span className="font-semibold">
                        Technology Stack:
                      </span>{" "}
                      {proj.techStack}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CERTIFICATIONS */}
        {certs && certs.length > 0 && (
          <>
            <SectionTitle title="Certificates" />
            <ul className="ml-5 mb-2 list-disc space-y-0.5">
              {certs.map((c, i) => (
                <li key={i}>
                  {c.name || "Certification"}{" "}
                  {c.issuer && `(${c.issuer})`}{" "}
                  {c.year && `– ${c.year}`}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* WORKSHOPS / ACHIEVEMENTS */}
        {achievements && achievements.length > 0 && (
          <>
            <SectionTitle title="Workshops / Achievements" />
            <ul className="ml-5 mb-2 list-disc space-y-0.5">
              {achievements.map((ach, i) => (
                <li key={i}>{ach}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
});

function SectionTitle({ title }) {
  return (
    <div className="mt-2 mb-1 border-b border-gray-800">
      <h2 className="font-bold text-[12px] uppercase tracking-wide">
        {title}
      </h2>
    </div>
  );
}

export default ResumeTemplate;

