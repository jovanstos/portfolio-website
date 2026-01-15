import "../styles/Project.css";
import FadeInSection from "../components/FadeInSection";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectByID } from "../api/projects";
import { getProjectContentByID } from "../api/projectContent";
import type { projectContent, project, projectProps } from "../types/project"

function Project({
    subHeading = "To have the best experience desktop is recommended.",
    mainContent = null
}: projectProps) {
    const { id } = useParams<{ id: string }>();

    console.log(id);

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
            <main id="project">
                <p>Loading...</p>
            </main>
        );
    }

    if (projectQuery.error || contentQuery.error) {
        return (
            <main id="project">
                <p>Error loading project</p>
            </main>
        );
    }

    const projectData: any = projectQuery.data;
    const contentData: any = contentQuery.data;

    return (
        <main id="project">
            <h1>{projectData.title}</h1>
            <p style={{ marginBottom: "15px" }}>{subHeading}</p>
            {mainContent ? (
                mainContent
            ) : (
                <img
                    id="main-project-img"
                    src={projectData.imageurl}
                    alt={projectData.imagedescription}
                    width="1000"
                />
            )}
            <section className="project-content">
                {contentData?.map((articleData: any) => {
                    const hasText = Boolean(articleData.text);
                    const hasImage = Boolean(articleData.imageurl);

                    return (
                        <FadeInSection>
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
                        </FadeInSection>
                    );
                })}
            </section>
        </main>
    );
}

export default Project;
