import { Link } from "react-router-dom";
import type { CardProps } from "../types/cardTypes";
import { projectPath } from "../api/projectRegistry";
import "../styles/Card.css";
export default function ProjectCard({
  id = 1,
  title = "Untitled project",
  description,
  imgURL,
  imgDescription,
  variant = "medium",
}: CardProps & { variant?: "large" | "medium" | "small" }) {
  return (
    <Link className="card-a-tag" to={projectPath(id)}>
      <article className={`card ${variant}-card`}>
        <img
          src={imgURL || "/placeholder.webp"}
          alt={imgDescription || `${title} preview`}
          width={600}
          height={400}
          loading="lazy"
          onError={(event) => {
            if (!event.currentTarget.src.endsWith("/placeholder.webp"))
              event.currentTarget.src = "/placeholder.webp";
          }}
        />
        <div>
          <h3>{title}</h3>
          {variant === "large" && description && (
            <p className="card-description">{description}</p>
          )}
          <span className="card-action">Open project →</span>
        </div>
      </article>
    </Link>
  );
}
