import "../styles/About.css";
import Timeline from "../components/Timeline";
import Stars from "../components/Stars";
import FadeInSection from "../components/FadeInSection";

function About() {
  const timelineItems = [
    {
      id: "t1",
      date: "August 2020",
      title: "Started My CS Degree",
      description: "FILL IN",
    },
    {
      id: "t2",
      date: "February 2023",
      title: "I sold my car & Started Bootcamp",
      description: "FILL IN",
    },
    {
      id: "t3",
      date: "August 2023",
      title: "Got Hired At RIM Logistics",
      description: "FILL IN",
    },
    {
      id: "t4",
      date: "August 2024",
      title: "Went Back To College Online",
      description: "FILL IN",
    },
    {
      id: "t100",
      date: "December 2025",
      title: "Graduted College",
      description: "FILL IN",
    },
  ];

  return (
    <div id="about-background">
      <Stars speed={5} />
      <main id="about">
        <h1 style={{ color: "white", textAlign: "center", paddingTop: "50px" }}>
          About Me
        </h1>
        <p style={{ color: "white", textAlign: "center" }}>
          It's a good read trust me, but if you don't scroll to the bottom for a
          TLDR
        </p>
        <FadeInSection>
          <section className="about-section">
            <article className="about-article-left">
              <h2>I Sold My Car For This</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>
            </article>
            <img src="temp.jpg" width={"180px"} alt="About" />
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <img src="temp.jpg" width={"180px"} alt="About" />
            <article className="about-article-right">
              <h2>Title</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>
            </article>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <article className="about-article-left">
              <h2>TLDR;</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>
            </article>
            <img src="temp.jpg" width={"180px"} alt="About" />
          </section>
        </FadeInSection>
        <FadeInSection>
          <h1 style={{ color: "white", textAlign: "center" }}>Timeline</h1>
          <p style={{ color: "white", textAlign: "center" }}>
            Here is a timeline of key events
          </p>
          <section>
            <Timeline items={timelineItems} />
          </section>
        </FadeInSection>
      </main>
    </div>
  );
}

export default About;
