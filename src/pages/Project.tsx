import "../styles/Project.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectByID } from "../api/projects";
import { getProjectContentByID } from "../api/projectContent";
import type { projectContent, project } from "../types/project"

function Project() {
    const { id } = useParams<{ id: string }>();

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
                <main id="project">
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
                <main id="project">
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
            <main id="project">
                <h1>{projectData.title}</h1>
                <p style={{ marginBottom: "15px" }}>To have the best experience desktop is recommended.</p>
                <img
                    id="main-project-img"
                    src={projectData.imageurl}
                    alt={projectData.imagedescription}
                    width="1000"
                />
                <section className="project-content">
                    {contentData?.map((articleData: any) => {
                        const hasText = Boolean(articleData.text);
                        const hasImage = Boolean(articleData.imageurl);

                        return (
                            <article className="project-article" key={articleData.id}>
                                {hasImage && (
                                    <>
                                        <h2 className="project-h2">{articleData.title}</h2>
                                        <img
                                            src={articleData.imageurl}
                                            alt={articleData.imagedescription || ""}
                                            width={750}
                                        />
                                        <p style={{ textAlign: "center" }}>{!hasText ? articleData.imagedescription : ""}</p>
                                    </>
                                )}
                                {hasText && <p>{articleData.text}</p>}
                            </article>
                        );
                    })}
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Project;
