import "../styles/Project.css";
import FadeInSection from "../components/FadeInSection";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectByID } from "../api/projects";
import { getProjectContentByID } from "../api/projectContent";
import type {
  ProjectContent,
  ProjectData,
  ProjectProps,
} from "../types/projectTypes";
import ErrorPopup from "../components/ErrorPopup";
import Markdown from "react-markdown";

function Project({
  id: propId,
  subHeading = "To have the best experience desktop is recommended.",
  mainContent = null,
}: ProjectProps) {
  const { id: paramId } = useParams();
  // If it's a live project tis part is important to get the correct ID
  const id = propId || paramId;

  const navigate = useNavigate();

  // Queries to GET all the correct data
  const projectQuery = useQuery<ProjectData>({
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
          <ErrorPopup
            isError={contentQuery.isError}
            message={contentQuery.error}
          />
          <p>Error loading project</p>
        </main>
      );
    }
    return (
      <main id="project">
        <ErrorPopup
          isError={projectQuery.isError}
          message={projectQuery.error}
        />
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
      <section id="main-project-hero">
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
        <a href={projectData.url} rel="noopener noreferrer" target="_blank">
          Project URL/Github
        </a>
      </section>
      <section className="project-content">
        {projectData.description ? (
          <div className="project-description">
            <h1>Project Description:</h1>
            <p>{projectData.description}</p>
          </div>
        ) : (
          <></>
        )}
        <h1 style={{ marginBottom: "20px" }}>Indepth Project Articles:</h1>
        {contentData?.map((articleData: any) => {
          const hasText = Boolean(articleData.text);
          const hasImage = Boolean(articleData.imageurl);

          return (
            <FadeInSection>
              <article className="project-article" key={articleData.id}>
                <h2 className="project-h2">{articleData.title}</h2>
                {hasImage && (
                  <>
                    <img
                      src={articleData.imageurl}
                      alt={articleData.imagedescription || ""}
                      width={750}
                    />
                    <p style={{ textAlign: "center" }}>
                      {!hasText ? articleData.imagedescription : ""}
                    </p>
                  </>
                )}
                {hasText && <Markdown>{articleData.text}</Markdown>}
              </article>
            </FadeInSection>
          );
        })}
      </section>
      <button
        className="primary-button contact-button"
        onClick={() => navigate("/contact")}
      >
        Contact Me
      </button>
    </main>
  );
}

export default Project;
