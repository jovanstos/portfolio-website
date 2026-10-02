import "../styles/Project.css";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectByID } from "../api/projects";
import { getProjectContentByID } from "../api/projectContent";
import { ApiError } from "../api/client";
import type { ProjectProps } from "../types/projectTypes";
import QueryFeedback from "../components/QueryFeedback";
import Markdown from "react-markdown";
const liveNames: Record<number, string> = {
  6: "Zipline",
  7: "Chimp Converter",
  8: "JovanLang",
  9: "SpellCaster",
  10: "P.I.M.",
};
export default function Project({
  id: propId,
  subHeading,
  mainContent = null,
}: ProjectProps) {
  const { id: paramId } = useParams();
  const id = propId ?? Number(paramId);
  const valid = Number.isSafeInteger(id) && id > 0;
  const project = useQuery({
    queryKey: ["project", id],
    queryFn: getProjectByID,
    enabled: valid,
  });
  const articles = useQuery({
    queryKey: ["projectContent", id],
    queryFn: getProjectContentByID,
    enabled: valid,
  });
  const title = project.data?.title ?? liveNames[id] ?? "Project";
  useEffect(() => {
    document.title = `${title} · Jovan Stosic`;
  }, [title]);
  if (!valid)
    return (
      <main id="project">
        <h1>Invalid project address</h1>
        <Link to="/projects">Back to projects</Link>
      </main>
    );
  if (
    !mainContent &&
    project.error instanceof ApiError &&
    project.error.status === 404
  )
    return (
      <main id="project">
        <h1>Project not found</h1>
        <p>It may have moved or is no longer public.</p>
        <Link to="/projects">See other projects</Link>
      </main>
    );
  return (
    <main id="project">
      <header className="project-header">
        <Link to="/projects">← All projects</Link>
        <h1>{title}</h1>
        {subHeading && <p>{subHeading}</p>}
      </header>
      <section id="main-project-hero" aria-label="Project preview">
        {mainContent ?? (
          <>
            <QueryFeedback
              loading={project.isPending}
              error={project.error}
              onRetry={() => void project.refetch()}
            />
            {project.data && (
              <img
                id="main-project-img"
                src={project.data.imageurl}
                alt={project.data.imagedescription || `${title} preview`}
                width={1000}
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.webp";
                }}
              />
            )}
          </>
        )}
        {project.data?.url && /^https?:\/\//.test(project.data.url) && (
          <a
            className="button-link secondary-button"
            href={project.data.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Project URL / GitHub ↗
          </a>
        )}
      </section>
      {mainContent && (
        <QueryFeedback
          loading={project.isPending}
          error={project.error}
          onRetry={() => void project.refetch()}
        />
      )}
      <section className="project-content">
        {project.data?.description && (
          <div className="project-description">
            <h2>Behind the project</h2>
            <p>{project.data.description}</p>
          </div>
        )}
        <h2>Notes from the build</h2>
        <QueryFeedback
          loading={articles.isPending}
          error={articles.error}
          empty={articles.data?.length === 0}
          onRetry={() => void articles.refetch()}
        />
        {articles.data?.map((article) => (
          <article key={article.id} className="project-article">
            <h3>{article.title}</h3>
            {article.imageurl && (
              <figure>
                <img
                  src={article.imageurl}
                  alt={article.imagedescription || ""}
                  width={750}
                  loading="lazy"
                />
                {!article.text && article.imagedescription && (
                  <figcaption>{article.imagedescription}</figcaption>
                )}
              </figure>
            )}
            {article.text && <Markdown>{article.text}</Markdown>}
          </article>
        ))}
      </section>
      <Link className="primary-button button-link contact-button" to="/contact">
        Contact me
      </Link>
    </main>
  );
}
