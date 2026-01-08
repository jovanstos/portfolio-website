import "../styles/Junk.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import { useNavigate } from 'react-router-dom';

function Junk() {

    const navigate = useNavigate();

    function handleButtonClick(href: string) {
        navigate(href);
    };

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="junk">
                <div style={{ marginBottom: "50px" }}>
                    <h1>Junk Yard</h1>
                    <p>All the treasures and trinkets</p>
                    <button style={{ marginTop: "10px" }} className="primary-button contact-button" onClick={() => handleButtonClick("/contact")}>
                        Contact Me
                    </button>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Junk;
