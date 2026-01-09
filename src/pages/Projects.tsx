import "../styles/Projects.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import MediumCard from "../cards/MediumCard";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";

type ProjectsProps = {
    title?: string;
    projectType?: string;
    subheading?: string;
};

function Projects({
    title,
    projectType = "regular",
    subheading
}: ProjectsProps) {
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ["projects", projectType],
        queryFn: getProjects,
    });

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="projects">
                <div style={{ marginBottom: "50px", textAlign: "center" }}>
                    <h1>{title}</h1>
                    <p>{subheading}</p>
                    <button style={{ marginTop: "10px" }} className="primary-button contact-button" onClick={() => navigate("/contact")}>
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
