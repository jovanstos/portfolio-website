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
      description: "It's peak COVID and I started college.",
    },
    {
      id: "t2",
      date: "January 2021",
      title: "Lost My FAFSA",
      description: "My mother remarried and I had financial stress.",
    },
    {
      id: "t3",
      date: "February 2023",
      title: "I Sold My Car & Started Bootcamp",
      description: "Took the massive risk to try and change my life!",
    },
    {
      id: "t4",
      date: "August 2023",
      title: "Got Hired At RIM Logistics",
      description: "I got the job!",
    },
    {
      id: "t5",
      date: "August 2024",
      title: "Went Back To College Online",
      description:
        "I worked full time while also doing college. Super exhausting.",
    },
    {
      id: "t6",
      date: "December 2025",
      title: "Graduated College",
      description: "After fighting for years I finally did it!",
    },
    {
      id: "t100",
      date: "February 2026",
      title: "Left RIM Logistics",
      description: "Took the risk to grow as an engineer!",
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
          It's a good read, trust me—but if you're in a hurry, just read the
          TLDR;
        </p>
        <FadeInSection>
          <section className="about-section">
            <img
              src="https://portfolio-website-image-bucket.nyc3.digitaloceanspaces.com/clock.webp"
              width={"180px"}
              alt="A picture of a clock"
            />
            <article className="about-article-right">
              <h2>TLDR;</h2>
              <p>
                I faced severe setbacks during COVID from 2020 to 2022, so I
                took a massive risk and sold everything I had to attend a coding
                bootcamp. That relentless drive helped me earn my first job as a
                software engineer. Still hungry to finish what I started, I went
                back to school while working full-time and finally earned my
                Computer Science degree in December 2025.
              </p>
            </article>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <article className="about-article-left">
              <h2>The Setbacks</h2>
              <p>
                My story begins in August 2020. I’ve always grown up around
                computers and knew I wanted to program, but starting my Computer
                Science degree during peak COVID was a nightmare. Between school
                systems losing my paperwork, my mother remarrying causing me to
                lose my FAFSA, a dislocated knee that sidelined my studies, and
                eventually losing my part-time job to company layoffs—I found
                myself at an absolute low. I was stressed, struggling, and out
                of options. But I knew I couldn't give up.
              </p>
            </article>
            <img
              src="https://portfolio-website-image-bucket.nyc3.digitaloceanspaces.com/jovan-school-covid.jpg"
              width={"180px"}
              alt="Early college days"
            />
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <img
              src="https://portfolio-website-image-bucket.nyc3.digitaloceanspaces.com/jovan-old-car.webp"
              width={"180px"}
              alt="A picture of the car I sold"
            />
            <article className="about-article-right">
              <h2>Selling My Car For A Dream</h2>
              <p>
                I needed to figure out a new path and discovered a software
                engineering bootcamp. The only issue? It cost $15,000. I didn’t
                have that kind of money, but I did have one asset to my name: my
                car. Taking a massive leap of faith, I sold it to pay my
                tuition. I realized this was my last shot, so I stayed up all
                night, every night, learning and practicing. That relentless
                grind paid off when I earned my first role as a software
                engineer at RIM Logistics.
              </p>
            </article>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <article className="about-article-left">
              <h2>Finishing The Mission</h2>
              <p>
                While working as a software engineer, something still didn’t sit
                right with me. I wanted that degree. I had this hunger to push
                further, so I enrolled in an online college program to finally
                get my Bachelor's in Computer Science. For a full year, I worked
                tirelessly, bouncing between my full-time engineering job and
                daily coursework. The exhaustion was completely worth it when I
                graduated in December 2025. I finally achieved what I set out to
                do years ago.
              </p>
            </article>
            <img
              src="https://portfolio-website-image-bucket.nyc3.digitaloceanspaces.com/jovan-degree.webp"
              width={"180px"}
              alt="Picture of degree"
            />
          </section>
        </FadeInSection>
        <FadeInSection>
          <h1 style={{ color: "white", textAlign: "center" }}>Timeline</h1>
          <p style={{ color: "white", textAlign: "center" }}>
            A quick look at the journey
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
