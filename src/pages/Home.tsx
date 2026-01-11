import "../styles/Home.css";
import { useNavigate } from 'react-router-dom';
import Hero from "../components/Hero";
import LargeCard from "../cards/LargeCard";
import MediumCard from "../cards/MediumCard";
import SmallCard from "../cards/SmallCard";
import FadeInSection from "../components/FadeInSection";

function Home() {

  const navigate = useNavigate();

  return (
    <>
      <Hero />
      <main id="home">
        <section className="home-projects">
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center" }}>Featured Projects</h1>
          <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
            Some of my favorites
          </p>
          <div className="card-holder">
            <FadeInSection>
              <LargeCard />
            </FadeInSection>
            <FadeInSection>
              <LargeCard />
            </FadeInSection>
            <FadeInSection>
              <LargeCard />
            </FadeInSection>
          </div>
          <FadeInSection>
            <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center", marginTop: "var(--space-md)" }}>All Projects</h1>
            <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
              Some more great ones
            </p>
            <div className="card-holder">
              <MediumCard />
              <MediumCard />
            </div>
            <FadeInSection>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="primary-button" onClick={() => navigate("/projects")}>See more</button>
              </div>
            </FadeInSection>
          </FadeInSection>
          <FadeInSection>
            <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center", marginTop: "var(--space-md)" }}>Junk Yard</h1>
            <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
              Just some treasures and trinkets
            </p>
            <div style={{ marginBottom: "var(--space-md)" }} className="card-holder">
              <SmallCard />
              <SmallCard />
            </div>
            <FadeInSection>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="primary-button" onClick={() => navigate("/junk")}>See more</button>
              </div>
            </FadeInSection>
          </FadeInSection>
        </section>
      </main>
    </>
  );
}

export default Home;
