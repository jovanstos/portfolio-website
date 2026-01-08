import "../styles/Projects.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import MediumCard from "../cards/MediumCard";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";

function Projects() {

    const { data, isLoading, error } = useQuery({
        queryKey: ["projects", "regular"],
        queryFn: getProjects,
    });

    const navigate = useNavigate();

    function handleButtonClick(href: string) {
        navigate(href);
    };

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="projects">
                <div style={{ marginBottom: "50px" }}>
                    <h1>All Projects</h1>
                    <button style={{ marginTop: "10px" }} className="primary-button contact-button" onClick={() => handleButtonClick("/contact")}>
                        Contact Me
                    </button>
                </div>
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error loading projects</p>
                ) : (
                    data!.map((project) => (
                        <MediumCard
                            key={project.id}
                            id={project.id}
                            title={project.title}
                            imgURL={project.imageurl}
                            imgDescription={project.imagedescription}
                        />
                    ))
                )}
            </main>
            <Footer />
        </>
    );
}

export default Projects;
