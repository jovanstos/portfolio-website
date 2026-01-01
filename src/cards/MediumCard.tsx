import "../styles/Card.css";

type CardProps = {
    id?: number;
    title?: string;
    description?: string;
    imgURL?: string;
};


function MediumCard({
    // id = 1,
    title = "No Title Found",
    // description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    imgURL = "placeholder.png",
}: CardProps) {
    return (
        <article className="medium-card card">
            <img src={imgURL} alt="placeholder image" width={"300px"} />
            <div>
                <h2>{title}</h2>
            </div>
        </article>
    );
}

export default MediumCard;