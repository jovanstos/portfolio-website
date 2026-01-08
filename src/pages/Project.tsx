import "../styles/Projects.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { getProjectByID } from "../api/projects";
import { useParams } from 'react-router-dom';

function Project() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading, error } = useQuery({
        queryKey: ["projects", id!],
        queryFn: getProjectByID,
        enabled: !!id,
    });

    console.log(data);

    const navigate = useNavigate();

    function handleButtonClick(href: string) {
        navigate(href);
    };

    if (isLoading) {
        return (
            <>
                <Nav />
                <LightDarkToggle />
                <main id="projects">
                    <p>Loading...</p>
                </main>
                <Footer />
            </>
        );
    } else if (error) {
        return (
            <>
                <Nav />
                <LightDarkToggle />
                <main id="projects">
                    <p>Error loading projects</p>
                </main>
                <Footer />
            </>
        );
    } else {
        return (
            <>
                <Nav />
                <LightDarkToggle />
                <main id="projects">
                    <div style={{ marginBottom: "50px" }}>
                        <h1>{data?.title}</h1>
                        <button style={{ marginTop: "10px" }} className="primary-button contact-button" onClick={() => handleButtonClick("/contact")}>
                            Contact Me
                        </button>
                    </div>
                    <img src={data?.imageurl} alt={data?.imagedescription} width={"1000px"} />
                </main>
                <Footer />
            </>
        );
    }
}

export default Project;
