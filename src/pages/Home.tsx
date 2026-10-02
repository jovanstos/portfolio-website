import "../styles/Home.css";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";
import Hero from "../components/Hero";
import ProjectCard from "../cards/ProjectCard";
import FadeInSection from "../components/FadeInSection";
import QueryFeedback from "../components/QueryFeedback";
function ProjectSection({
  type,
  title,
  subtitle,
  limit,
  variant,
  href,
}: {
  type: string;
  title: string;
  subtitle: string;
  limit: number;
  variant: "large" | "medium" | "small";
  href: string;
}) {
  const query = useQuery({
    queryKey: ["projects", type],
    queryFn: getProjects,
  });
  return (
    <section className="home-projects">
      <header className="section-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      <QueryFeedback
        loading={query.isPending}
        error={query.error}
        empty={query.data?.length === 0}
        onRetry={() => void query.refetch()}
      />
      <div className={`card-holder ${variant === "small" ? "small-grid" : ""}`}>
        {query.data?.slice(0, limit).map((project) => (
          <FadeInSection key={project.id}>
            <ProjectCard
              variant={variant}
              id={project.id}
              title={project.title}
              description={project.description}
              imgURL={project.imageurl}
              imgDescription={project.imagedescription}
            />
          </FadeInSection>
        ))}
      </div>
      <Link className="secondary-button button-link" to={href}>
        See more →
      </Link>
    </section>
  );
}
export default function Home() {
  return (
    <main id="home">
      <Hero />
      <section className="home-tools" aria-label="Quick tools">
        <Link to="/zipline">
          <strong>Zipline ↗</strong>
          <span>Scan a code. Share between devices.</span>
        </Link>
        <Link to="/converter">
          <strong>Chimp Converter ↗</strong>
          <span>Change an image's format without the fuss.</span>
        </Link>
      </section>
      <details className="home-tip">
        <summary>New here?</summary>
        <p>
          The rocket ship in the top left is a spinable wheel with the
          navigation links. The sun/moon in the top right is to switch between
          light/dark mode. Also, this is a MEGA monolith app; it has multiple
          services and live projects. You can learn more about the app by going
          to the detailed explanation here:{" "}
          <Link to="/projects/id/17">Project Page</Link>
        </p>
      </details>
      <div className="home-sections">
        <ProjectSection
          type="featured"
          title="Featured projects"
          subtitle="Some of my favorites"
          limit={3}
          variant="large"
          href="/projects"
        />
        <ProjectSection
          type="regular"
          title="All Projects"
          subtitle="Some more great ones"
          limit={6}
          variant="medium"
          href="/projects"
        />
        <ProjectSection
          type="junk"
          title="Junk Yard"
          subtitle="Just some treasures and trinkets"
          limit={6}
          variant="small"
          href="/junk"
        />
      </div>
    </main>
  );
}
