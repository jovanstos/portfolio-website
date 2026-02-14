import "../styles/Card.css";
import type { CardProps } from "../types/cardTypes";
import { internalProjectIDs } from "./LargeCard";

// Reusable cards used to show projects in different sizes

function SmallCard({
  id = 1,
  // title = "No Title Found",
  // description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  imgURL = "placeholder.webp",
  imgDescription = "placeholder image",
}: CardProps) {
  const isInternal = internalProjectIDs.has(id);

  const url = isInternal ? `/projects/live/${id}` : `/projects/id/${id}`;

  return (
    <a className="card-a-tag" href={url} rel="noopener noreferrer">
      <article className="small-card card">
        <img
          src={imgURL}
          alt={imgDescription}
          width={"200px"}
          height={"150px"}
        />
      </article>
    </a>
  );
}

export default SmallCard;
