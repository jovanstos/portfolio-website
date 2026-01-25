import "../styles/Card.css";
import type { CardProps } from "../types/cardTypes";

// Export out internal project ids so it is DRY and can be used else where
export const internalProjectIDs = new Set<number>([6, 7]);

// Reusable cards used to show projects in different sizes
function LargeCard({
    id = 1,
    title = "No Title Found",
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    imgURL = "placeholder.webp",
    imgDescription = "placeholder image"
}: CardProps) {

    const isInternal = internalProjectIDs.has(id);

    const url = isInternal
        ? `/projects/live/${id}`
        : `/projects/id/${id}`;

    return (
        <a className="card-a-tag" href={url} rel="noopener noreferrer">
            <article className="large-card card">
                <img src={imgURL} alt={imgDescription} width={"300px"} height={"200px"} />
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <p>Click to see more</p>
                </div>
            </article>
        </a>
    );
}

export default LargeCard;