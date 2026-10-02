import "../styles/Resume.css";
import { Link } from "react-router-dom";
import Dropdown from "../components/DropDown";
const pdf =
  "https://portfolio-website-image-bucket.nyc3.digitaloceanspaces.com/Jovan_Stosic_Resume_WEB.pdf";
const achievements = [
  "Developed and deployed RIM Report Maker using Python, Pandas, and CargoWise MySQL, automating vital client reports and replacing a legacy system.",
  "Reduced operational overhead by 99%, cutting monthly costs from several thousand dollars to just $2.00/month through the report maker.",
  "Enabled new revenue streams through high-reliability reporting services, enhanced client satisfaction, and improved data accessibility.",
  "Developed and deployed Vector Force, an end-to-end RAG pipeline using Python, Pinecone, and Salesforce SOQL to streamline internal case resolution.",
  "Architected a secure, locally hosted LLM environment on a Linux VM to vectorize and query sensitive Salesforce case data. Integrated Pinecone for high-performance similarity searches.",
  "Developed and deployed EasyPeasySQL, a Python Tkinter SQL IDE for staff and temporary employees to securely access databases in a monitored environment.",
  "Developed Altova Interchange, Python middleware integrated with Altova FlowForce and MySQL to automate the company-wide digital invoice pipeline, replacing an unstable legacy system with real-time document tracking.",
  "Introduced and set up the company's Git, GitHub, and DevOps workflows.",
];
const education = [
  [
    "Western Governors University",
    "Bachelor of Science, Computer Science",
    "August 2024 – December 2025",
  ],
  [
    "Fullstack Academy",
    "Software Engineering Bootcamp",
    "February 2023 – July 2023",
  ],
  [
    "College of DuPage",
    "Associate in Science & Engineering",
    "August 2020 – December 2022",
  ],
];
const certifications = [
  {
    title: "ITIL® Foundation",
    date: "November 2025",
    provider: "PeopleCert",
    credential: "GR671831016JS",
  },
  {
    title: "Linux Essentials Certification",
    date: "October 2025",
    provider: "Linux Professional Institute (LPI)",
    credential: "tq4dylymmj",
    url: "https://lpi.org/v/LPI000671780/tq4dylymmj",
  },
  {
    title: "Fundamentals of Cybersecurity Skill Path",
    date: "July 2024",
    provider: "Codecademy",
    url: "https://www.codecademy.com/profiles/jovanstos/certificates/06984a073b064e61879cca3e82a9b3d2",
  },
  {
    title: "Computer Science Career Path",
    date: "June 2024",
    provider: "Codecademy",
    url: "https://www.codecademy.com/profiles/jovanstos/certificates/05009c20e9174378acd37e6c2d0fbfc4",
  },
];
export default function Resume() {
  return (
    <main id="resume">
      <header className="section-heading">
        <h1>Résumé</h1>
        <p>
          Some personal information has been removed. Feel free to contact me
          for more.
        </p>
        <div className="resume-actions">
          <a
            className="primary-button button-link"
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open PDF ↗
          </a>
          <Link
            className="primary-button button-link contact-button"
            to="/contact"
          >
            Contact me
          </Link>
        </div>
        <p className="resume-note">
          Use your PDF viewer's save/download action to keep a copy.
        </p>
      </header>
      <article id="resume-text">
        <header id="resume-header">
          <h2>Jovan Stosic</h2>
          <p>
            <a href="mailto:jovanstosic012@gmail.com">
              jovanstosic012@gmail.com
            </a>{" "}
            ·{" "}
            <a
              href="https://www.linkedin.com/in/jovanstosic12/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{" "}
            ·{" "}
            <a
              href="https://github.com/jovanstos"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            · <Link to="/">jovanstosic.dev</Link>
          </p>
        </header>
        <section className="resumeSection">
          <h2>Executive summary</h2>
          <p>
            High-energy and deeply passionate Software Engineer driven by a love
            for continuous learning and technical problem-solving. Proficient
            across a diverse stack of languages including Python, TypeScript,
            and Java, and highly adept at leveraging modern agentic AI
            development tools to accelerate coding and build robust, full-stack
            architectures. Dedicated to delivering measurable business impact,
            demonstrated by engineering automated enterprise pipelines that
            reduced operational overhead by 99%.
          </p>
        </section>
        <section className="resumeSection">
          <h2>Technical skills</h2>
          <p>
            <strong>Languages:</strong> Python, JavaScript/TypeScript, Java,
            SQL, HTML, CSS, C++
          </p>
          <p>
            <strong>Frameworks & libraries:</strong> React, Vue, Spring Boot,
            Electron.js, Pandas, TensorFlow, Hugging Face, Scikit-Learn
          </p>
          <p>
            <strong>Tools & infrastructure:</strong> Agentic AI Development,
            Claude Code, Git, GitHub/GitLab, Docker, PostgreSQL, MySQL, MongoDB
          </p>
        </section>
        <section className="resumeSection">
          <h2>Education</h2>
          {education.map(([school, degree, date]) => (
            <div className="resumeDetail" key={school}>
              <div>
                <h3>{school}</h3>
                <p>{degree}</p>
              </div>
              <p>{date}</p>
            </div>
          ))}
        </section>
        <section className="resumeSection">
          <h2>Professional experience</h2>
          <div className="resumeDetail">
            <div>
              <h3>RIM Logistics</h3>
              <p>Software Engineer · Bartlett, IL</p>
            </div>
            <p>August 2023 – February 2026</p>
          </div>
          <Dropdown title="Project details & impact">
            <ul>
              {achievements.map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </Dropdown>
          <div className="resumeDetail">
            <div>
              <h3>RIM Logistics</h3>
              <p>Intern · Bartlett, IL</p>
            </div>
            <p>June 2022 – January 2023</p>
          </div>
        </section>
        <section className="resumeSection">
          <h2>Licenses & certifications</h2>
          {certifications.map((item) => (
            <div className="resumeDetail" key={item.title}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.provider}</p>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View credential ↗
                  </a>
                ) : (
                  <p>Credential ID {item.credential}</p>
                )}
              </div>
              <p>{item.date}</p>
            </div>
          ))}
        </section>
        <section className="resumeSection">
          <h2>Projects</h2>
          <p>
            For this section all of the relevant projects are on this site, so
            just explore around! <Link to="/projects">See them all →</Link>
          </p>
        </section>
      </article>
    </main>
  );
}
