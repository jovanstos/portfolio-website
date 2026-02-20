import "../styles/Resume.css";
import FadeInSection from "../components/FadeInSection";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/DropDown";

function Resume() {
  const pdfUrl =
    "https://portfolio-website-image-bucket.nyc3.digitaloceanspaces.com/Jovan_Stosic_Resume_WEB.pdf";

  const navigate = useNavigate();

  return (
    <main id="resume">
      <h1>Resume</h1>
      <p>
        Presonal informaiton has been removed but feel free to contact me for
        more info!
      </p>
      <button
        style={{ marginTop: "10px" }}
        className="primary-button contact-button"
        onClick={() => navigate("/contact")}
      >
        Contact Me
      </button>
      <article id="resume-text">
        <FadeInSection>
          <header id="resume-header">
            <h1>Jovan Stosic</h1>
            <a
              href="mailto:jovanstosic012@gmail.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              jovanstosic012@gmail.com
            </a>{" "}
            •{" "}
            <a
              href="https://www.linkedin.com/in/jovanstosic12/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Linkedin
            </a>{" "}
            •{" "}
            <a
              href="https://github.com/jovanstos"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>{" "}
            •{" "}
            <a
              href="https://jovanstosic.dev/"
              rel="noopener noreferrer"
              target="_blank"
            >
              jovanstosic.dev
            </a>
          </header>
        </FadeInSection>
        <FadeInSection>
          <section className="resumeSection">
            <h3>Education</h3>
            <hr />
            <div className="resumeDetail">
              <h4>Western Governors University</h4>
              <p>Online</p>
            </div>
            <div className="resumeDetail">
              <p>Computer Science</p>
              <p>August 2024 - December 2025</p>
            </div>
            <div className="resumeDetail">
              <h4>Fullstack Academy</h4>
              <p>Online</p>
            </div>
            <div className="resumeDetail">
              <p>Software Engineering Boot Camp</p>
              <p>February 2023 - July 2023</p>
            </div>
            <div className="resumeDetail">
              <h4>College Dupage</h4>
              <p>Glen Ellyn, IL</p>
            </div>
            <div className="resumeDetail">
              <p>Associates In Science & Engineering</p>
              <p>August 2020 - December 2022</p>
            </div>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="resumeSection">
            <h3>Professional Experience</h3>
            <hr />
            <div className="resumeDetail">
              <h4>RIM Logistics</h4>
              <p>August 2023 - February 2026</p>
            </div>
            <div className="resumeDetail">
              <p>Software Engineer</p>
              <p>Bartlett, IL</p>
            </div>
            <Dropdown title="Details">
              <ul>
                <li>
                  Developed and deployed "RIM Report Maker" using Python,
                  Pandas, and CargoWise MySQL, automating the generation of
                  vital client reports and replacing a legacy system.
                </li>
                <li>
                  Reduced operational overhead by 99%, cutting monthly costs
                  from several thousand dollars to just $2.00/month, because of
                  the report maker.
                </li>
                <li>
                  Enabled new revenue streams by providing high-reliability
                  reporting services, significantly increasing enterprise value
                  through enhanced client satisfaction and data accessibility.
                </li>
                <li>
                  Developed and deployed "Vector Force" an end-to-end RAG
                  (Retrieval-Augmented Generation) pipeline using Python,
                  Pinecone, and Salesforce SoQL to streamline internal case
                  resolution.
                </li>
                <li>
                  With "Vector Force" I architected a secure, locally-hosted LLM
                  environment on a Linux VM to vectorize and query sensitive
                  Salesforce case data, improving team response times and
                  accuracy. Integrated Pinecone Vector Database to enable
                  high-performance similarity searches.
                </li>
                <li>
                  Developed and deployed "EasyPeasySQL" a Python Tkinter SQL
                  IDE, used for staff and temporary employees to securely access
                  the database. This IDE allowed the team to monitor and track
                  usage of the database in our own secure environment.
                </li>
                <li>
                  Developed "Altova Interchange," a robust Python middleware
                  integrated with Altova FlowForce and MySQL to automate the
                  company-wide digital invoice pipeline, replacing an unstable
                  legacy system with a high-availability solution featuring
                  real-time document tracking.
                </li>
                <li>Introduced and set up the companies Git and Github.</li>
                <li>Introduced and set up the companies DevOps.</li>
              </ul>
            </Dropdown>
            <div className="resumeDetail">
              <h4>RIM Logistics</h4>
              <p>June 2022 - January 2023</p>
            </div>
            <div className="resumeDetail">
              <p>Intern</p>
              <p>Bartlett, IL</p>
            </div>
            <Dropdown title="Details">
              <ul>
                <li>
                  Gained knowledge of office operations and logistics
                  terminology at RIM.
                </li>
                <li>
                  Communicated effectively with stakeholders for real-time
                  shipment updates.
                </li>
                <li>Monitored and addressed shipment progress issues.</li>
                <li>Organized documents and maintained systematic records.</li>
                <li>
                  Collaborated in a team environment to meet deadlines
                  efficiently.
                </li>
              </ul>
            </Dropdown>
            <div className="resumeDetail">
              <h4>Z37E Clothing</h4>
              <p>February 2021 - December 2022</p>
            </div>
            <div className="resumeDetail">
              <p>Self-employed</p>
              <p>Online</p>
            </div>
            <Dropdown title="Details">
              <ul>
                <li>
                  Founded and scaled Z37E Clothing, generating $1,500 in sales
                  within a year.
                </li>
                <li>
                  Managed a team of 4, delegating roles to boost productivity.
                </li>
                <li>Built and launched an engaging e-commerce website.</li>
                <li>
                  Developed marketing strategies to enhance brand visibility.
                </li>
                <li>
                  Oversaw material sourcing, manufacturing, and delivery
                  processes.
                </li>
                <li>
                  Demonstrated leadership and entrepreneurial skills to drive
                  business success.
                </li>
              </ul>
            </Dropdown>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="resumeSection">
            <h3>Licenses & Certifications</h3>
            <hr />
            <div className="resumeDetail">
              <h4>ITIL® Foundation</h4>
              <p>November 2025</p>
            </div>
            <div className="resumeDetail">
              <p>PeopleCert</p>
              <p>Credential ID GR671831016JS</p>
            </div>
            <div className="resumeDetail">
              <h4>Linux Essentials Certification</h4>
              <p>October 2025</p>
            </div>
            <div className="resumeDetail">
              <p>Linux Professional Institute (LPI)</p>
              <a
                href="http://lpi.org/v/LPI000671780/tq4dylymmj"
                rel="noopener noreferrer"
                target="_blank"
              >
                Credential ID tq4dylymmj
              </a>
            </div>
            <div className="resumeDetail">
              <h4>Fundamentals of Cybersecurity Skill Path</h4>
              <p>July 2024</p>
            </div>
            <div className="resumeDetail">
              <p>Codecademy</p>
              <a
                href="https://www.codecademy.com/profiles/jovanstos/certificates/06984a073b064e61879cca3e82a9b3d2"
                rel="noopener noreferrer"
                target="_blank"
              >
                Codecademy
              </a>
            </div>
            <div className="resumeDetail">
              <h4>Computer Science Career Path</h4>
              <p>June 2024</p>
            </div>
            <div className="resumeDetail">
              <p>Codecademy</p>
              <a
                href="https://www.codecademy.com/profiles/jovanstos/certificates/05009c20e9174378acd37e6c2d0fbfc4"
                rel="noopener noreferrer"
                target="_blank"
              >
                Codecademy
              </a>
            </div>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="resumeSection">
            <h3>Projects</h3>
            <hr />
            <p>
              For this section all of the relevant projects are on this site, so
              just explore around! Try:{" "}
              <a href="./projects" rel="noopener noreferrer">
                Projects
              </a>
            </p>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="resumeSection">
            <h3>Skills</h3>
            <hr />
            <p>
              <h4 style={{ display: "inline" }}>Programming Languages:</h4>{" "}
              Python, JavaScript/TypeScript, C++, Java, SQL, HTML, CSS
            </p>
            <p>
              <h4 style={{ display: "inline" }}>Frameworks & Libraries:</h4>{" "}
              React, Vue, Spring Boot, Electron.js, Pandas, TensorFlow
            </p>
            <p>
              <h4 style={{ display: "inline" }}>Tools & Infrastructure:</h4>{" "}
              Git, GitHub/GitLab/Bitbucket, Docker, Pinecone, PostgreSQL, MySQL
            </p>
            <p>
              <h4 style={{ display: "inline" }}>Concepts:</h4> REST APIs, CI/CD,
              DevOps, Machine Learning, LLM Agents / RAG, System Architecture
            </p>
          </section>
        </FadeInSection>
        <a
          href={pdfUrl}
          download="Jovan_Stosic_Resume_WEB.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button>Download PDF</button>
        </a>
      </article>
    </main>
  );
}

export default Resume;
