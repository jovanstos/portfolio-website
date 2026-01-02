import "../styles/About.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";

function About() {
    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="about">
                <h1>About Me</h1>
                <article>
                    <img src="temp.jpg" width={"250px"} />
                    <p>Put pics here showing my journey</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </article>
                <h1>Timeline</h1>
                <article>
                    <p>Nice timeline goes here</p>
                </article>
            </main >
            <Footer />
        </>
    );
}

export default About;
