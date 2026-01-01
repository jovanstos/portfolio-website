import "../styles/Home.css";
import type { ReactNode } from "react";
import Hero from "./Hero";
import LightDarkToggle from "../LightDarkToggle";
import Nav from "../Nav"
import LargeCard from "../cards/LargeCard";
import MediumCard from "../cards/MediumCard";
import SmallCard from "../cards/SmallCard";
import Footer from "../Footer";
import useIsVisible from "../hooks/useIsVisible";

type FadeInChildern = {
  children: ReactNode;
};

const FadeInSection = ({ children }: FadeInChildern) => {
  const { ref, isVisible } = useIsVisible({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
    >
      {children}
    </div>
  );
};

function Home() {
  return (
    <>
      <Nav />
      <LightDarkToggle />
      <Hero />
      <main>
        <section id="projects">
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
                <button className="primary-button">See more</button>
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
                <button className="primary-button">See more</button>
              </div>
            </FadeInSection>
          </FadeInSection>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
