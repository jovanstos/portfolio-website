import "../styles/Projects.css";
import ProjectCard from "../cards/ProjectCard";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";
import QueryFeedback from "../components/QueryFeedback";
import type { ProjectsProps } from "../types/projectTypes";
export default function Projects({
  title,
  projectType = "all",
  subheading,
}: ProjectsProps) {
  const query = useQuery({
    queryKey: ["projects", projectType],
    queryFn: getProjects,
  });
  return (
    <main id="projects">
      <header className="section-heading">
        <h1>{title}</h1>
        <p>
          {subheading ??
            "A collection of tools, experiments, and things I wanted."}
        </p>
      </header>
      <QueryFeedback
        loading={query.isPending}
        error={query.error}
        empty={query.data?.length === 0}
        onRetry={() => void query.refetch()}
      />
      <section id="projects-mapped" aria-label="Projects">
        {query.data?.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            imgURL={project.imageurl}
            imgDescription={project.imagedescription}
          />
        ))}
      </section>
    </main>
  );
}
