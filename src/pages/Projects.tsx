import "../styles/Projects.css";
import MediumCard from "../cards/MediumCard";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";
import ErrorPopup from "../components/ErrorPopup";
import type { ProjectsProps } from "../types/projectTypes";

function Projects({
    title,
    projectType = "regular",
    subheading
}: ProjectsProps) {
    const navigate = useNavigate();

    // Get the data form the query and using map populate the page
    const { data, isLoading, error, isError } = useQuery({
        queryKey: ["projects", projectType],
        queryFn: getProjects,
    });

    return (
        <main id="projects">
            <ErrorPopup isError={isError} message={error} />
            <div style={{ textAlign: "center" }}>
                <h1>{title}</h1>
                <p>{subheading}</p>
                <button style={{ marginTop: "10px" }} className="primary-button contact-button" onClick={() => navigate("/contact")}>
                    Contact Me
                </button>
            </div>
            <section id="projects-mapped">
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
            </section>
        </main>
    );
}

export default Projects;
