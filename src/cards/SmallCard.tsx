import "../styles/Card.css";

type CardProps = {
    id?: number;
    title?: string;
    description?: string;
    imgURL?: string;
    imgDescription?: string;
};


function SmallCard({
    id = 1,
    // title = "No Title Found",
    // description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    imgURL = "placeholder.png",
    imgDescription = "placeholder image"
}: CardProps) {

    const url = `/projects/id/${id}`

    return (
        <a className="card-a-tag" href={url} rel="noopener noreferrer">
            <article className="small-card card">
                <img src={imgURL} alt={imgDescription} width={"200px"} />
            </article>
        </a>
    );
}

export default SmallCard;
