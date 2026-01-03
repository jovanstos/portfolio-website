import "../styles/Projects.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import { useNavigate } from 'react-router-dom';

function Projects() {

    const navigate = useNavigate();

    function handleButtonClick(href: string) {
        navigate(href);
    };

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <h1>All Projects</h1>
            <button style={{ marginRight: "10px" }} className="primary-button contact-button" onClick={() => handleButtonClick("/contact")}>
                Contact Me
            </button>
            <Footer />
        </>
    );
}

export default Projects;
