import "../styles/Card.css";
import type { CardProps } from "../types/card";
import { internalProjectIDs } from "./LargeCard";

function MediumCard({
    id = 1,
    title = "No Title Found",
    // description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    imgURL = "placeholder.png",
    imgDescription = "placeholder image"
}: CardProps) {

    const isInternal = internalProjectIDs.has(id);

    const url = isInternal
        ? `/projects/live/${id}`
        : `/projects/id/${id}`;

    return (
        <a className="card-a-tag" href={url} rel="noopener noreferrer">
            <article className="medium-card card">
                <img src={imgURL} alt={imgDescription} width={"300px"} />
                <div>
                    <h2>{title}</h2>
                </div>
            </article>
        </a>
    );
}

export default MediumCard;