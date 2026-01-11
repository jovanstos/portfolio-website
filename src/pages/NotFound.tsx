import Stars from "../components/Stars";

function NotFound() {
    return (
        <div style={{ backgroundColor: "#13141c" }}>
            <Stars speed={5} />
            <main id="not-found">
                <h1>404 Page Not found</h1>
                <h2 style={{ marginTop: "15px" }}>Looks like you're lost 🥲</h2>
                <h2>Try heading home and seeing what you can find there!</h2>
                <a href="/" rel="noopener noreferrer">
                    <button style={{ marginTop: "15px" }} className="primary-button">
                        Home
                    </button>
                </a>
            </main>
        </div >
    );
}

export default NotFound;
