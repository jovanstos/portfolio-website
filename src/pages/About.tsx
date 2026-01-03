import "../styles/About.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import Timeline from "../components/Timeline";

function About() {
    const timelineItems = [
        {
            id: "t1",
            date: "August 2020",
            title: "Started My CS Degree",
            description:
                "FILL IN",
        },
        {
            id: "t2",
            date: "February 2023",
            title: "I sold my car & Started Bootcamp",
            description:
                "FILL IN",
        },
        {
            id: "t3",
            date: "August 2023",
            title: "Got Hired At RIM Logistics",
            description:
                "FILL IN",
        },
        {
            id: "t4",
            date: "August 2024",
            title: "Went Back To College Online",
            description:
                "FILL IN",
        },
        {
            id: "t100",
            date: "December 2025",
            title: "Graduted College",
            description:
                "FILL IN",
        },
    ];

    return (
        <>
            <Nav />
            <LightDarkToggle />
            <main id="about">
                <section id="aboutSection">
                    <h1>About Me</h1>
                    <p>It's a good read trust me</p>
                    <article id="aboutMainArticle">
                        <img src="temp.jpg" width={"200px"} alt="About" />
                        <p>Put pics here showing my journey</p>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
                        </p>
                    </article>
                    <h1>Timeline</h1>
                    <p>Here is a timeline of key events</p>
                    <article>
                        <Timeline items={timelineItems} />
                    </article>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default About;
