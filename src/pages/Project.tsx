import "../styles/Project.css";
import FadeInSection from "../components/FadeInSection";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectByID } from "../api/projects";
import { getProjectContentByID } from "../api/projectContent";
import type { ProjectContent, Project, ProjectProps } from "../types/projectTypes"
import ErrorPopup from "../components/ErrorPopup";

function Project({
    id: propId,
    subHeading = "To have the best experience desktop is recommended.",
    mainContent = null
}: ProjectProps) {
    const { id: paramId } = useParams();
    // If it's a live project tis part is important to get the correct ID
    const id = propId || paramId;

    // Queries to GET all the correct data
    const projectQuery = useQuery<Project>({
        queryKey: ["project", id!],
        queryFn: getProjectByID,
        enabled: !!id,
    });

    const contentQuery = useQuery<ProjectContent[]>({
        queryKey: ["projectContent", id!],
        queryFn: getProjectContentByID,
        enabled: !!id,
    });

    // Handle if the data is still loading
    if (projectQuery.isLoading || contentQuery.isLoading) {
        return (
            <main id="project">
                <p>Loading...</p>
            </main>
        );
    }

    // Handle if there is a error and display the correct message with the error popup
    if (projectQuery.error || contentQuery.error) {
        if (contentQuery.error) {
            return (
                <main id="project">
                    <ErrorPopup isError={contentQuery.isError} message={contentQuery.error} />
                    <p>Error loading project</p>
                </main>
            );
        }
        return (
            <main id="project">
                <ErrorPopup isError={projectQuery.isError} message={projectQuery.error} />
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
            {/* If it's a live project then the main content which is a react component should show, if now show the main photo*/}
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
