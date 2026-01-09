import "../styles/Projects.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectByID } from "../api/projects";
import { getProjectContentByID } from "../api/projectContent";
import type { projectContent, project } from "../types/project"

function Project() {
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const projectQuery = useQuery<project>({
        queryKey: ["project", id!],
        queryFn: getProjectByID,
        enabled: !!id,
    });

    const contentQuery = useQuery<projectContent[]>({
        queryKey: ["projectContent", id!],
        queryFn: getProjectContentByID,
        enabled: !!id,
    });

    if (projectQuery.isLoading || contentQuery.isLoading) {
        return (
            <>
                <Nav />
                <LightDarkToggle />
                <main id="projects">
                    <p>Loading...</p>
                </main>
                <Footer />
            </>
        );
    }

    if (projectQuery.error || contentQuery.error) {
        return (
            <>
                <Nav />
                <LightDarkToggle />
                <main id="projects">
                    <p>Error loading project</p>
                </main>
                <Footer />
            </>
        );
    }

    const projectData: any = projectQuery.data;
    const contentData: any = contentQuery.data;

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="projects">
                <div style={{ marginBottom: "50px", textAlign: "center" }}>
                    <h1>{projectData.title}</h1>
                    <button
                        className="primary-button contact-button"
                        onClick={() => navigate("/contact")}
                    >
                        Contact Me
                    </button>
                </div>
                <img
                    src={projectData.imageurl}
                    alt={projectData.imagedescription}
                    width="1000"
                />
                <section className="project-content">
                    {contentData?.map((articleData: any) => {
                        const hasText = Boolean(articleData.text);
                        const hasImage = Boolean(articleData.imageurl);

                        return (
                            <article key={articleData.id}>
                                {hasImage && (
                                    <img
                                        src={articleData.imageurl}
                                        alt={articleData.imagedescription || ""}
                                        width={hasText ? 750 : 750}
                                    />
                                )}
                                {hasText && <p>{articleData.text}</p>}
                            </article>
                        );
                    })}
                </section>
            </main >
            <Footer />
        </>
    );
}

export default Project;
