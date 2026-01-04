import "../styles/About.css";
import Nav from "../components/Nav";
import LightDarkToggle from "../components/LightDarkToggle";
import Footer from "../components/Footer";
import Timeline from "../components/Timeline";
import Stars from "../components/Stars";

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
            <Stars />
            <main id="about">
                <h1 style={{ color: "white", textAlign: "center", paddingTop: "50px" }}>About Me</h1>
                <p style={{ color: "white", textAlign: "center" }}>It's a good read trust me</p>
                <section className="about-section">
                    <article className="about-article-left">
                        <h2>I Sold My Car For This</h2>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
                        </p>
                    </article>
                    <img src="temp.jpg" width={"180px"} alt="About" />
                </section>
                <section className="about-section">
                    <img src="temp.jpg" width={"180px"} alt="About" />
                    <article className="about-article-right">
                        <h2>Title</h2>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
                        </p>
                    </article>
                </section>
                <h1 style={{ color: "white", textAlign: "center" }}>Timeline</h1>
                <p style={{ color: "white", textAlign: "center" }}>Here is a timeline of key events</p>
                <section>
                    <Timeline items={timelineItems} />
                </section>
            </main>
            <Footer />
        </>
    );
}

export default About;
