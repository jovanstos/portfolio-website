import "../styles/Resume.css";
import Nav from "../components/Nav";
import FadeInSection from "../components/FadeInSection";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import { useNavigate } from 'react-router-dom';

function Resume() {

    const navigate = useNavigate();

    function handleButtonClick(href: string) {
        navigate(href);
    };

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="resume">
                <h1>Resume</h1>
                <p>Presonal informaiton has been removed but feel free to contact me for more info!</p>
                <button style={{ marginTop: "10px" }} className="primary-button contact-button" onClick={() => handleButtonClick("/contact")}>
                    Contact Me
                </button>
                <article id="resume-text">
                    <FadeInSection>
                        <header id="resume-header">
                            <h1>Jovan Stosic</h1>
                            <a href="mailto:jovanstosic012@gmail.com" rel="noopener noreferrer" target="_blank">jovanstosic012@gmail.com</a> • <a href="https://www.linkedin.com/in/jovanstosic12/" rel="noopener noreferrer" target="_blank">Linkedin</a> • <a href="https://github.com/jovanstos" rel="noopener noreferrer" target="_blank">GitHub</a> • <a href="http://www.jovanstosic.dev" rel="noopener noreferrer" target="_blank">www.jovanstosic.dev</a>
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
                                <p>August 2023 - Present</p>
                            </div>
                            <div className="resumeDetail">
                                <p>Software Engineer</p>
                                <p>Bartlett, IL</p>
                            </div>
                            <div className="resumeDetail">
                                <h4>RIM Logistics</h4>
                                <p>June 2022 - January 2023</p>
                            </div>
                            <div className="resumeDetail">
                                <p>Intern</p>
                                <p>Bartlett, IL</p>
                            </div>
                            <p><mark>For more expernice dating back all the way to 2017 please reach out, and I will send you the full resume!</mark></p>
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
                                <a href="http://lpi.org/v/LPI000671780/tq4dylymmj" rel="noopener noreferrer" target="_blank">
                                    Credential ID tq4dylymmj
                                </a>
                            </div>
                            <div className="resumeDetail">
                                <h4>Fundamentals of Cybersecurity Skill Path</h4>
                                <p>Codecademy</p>
                            </div>
                            <div className="resumeDetail">
                                <h4>Computer Science Career Path</h4>
                                <p>Codecademy</p>
                            </div>
                        </section>
                    </FadeInSection>
                    <FadeInSection>
                        <section className="resumeSection">
                            <h3>Projects</h3>
                            <hr />
                            <p>For this section all of the relevant projects are on this site, so just explore around! Try: <a href="./projects" rel="noopener noreferrer">Projects</a></p>
                        </section>
                    </FadeInSection>
                    <FadeInSection>
                        <section className="resumeSection">
                            <h3>Skills</h3>
                            <hr />
                            <h3>Programming Languages: FILL IN</h3>
                            <h3>Software / Frameworks: FILL IN</h3>
                        </section>
                    </FadeInSection>
                </article>
            </main>
            <Footer />
        </>
    );
}

export default Resume;
