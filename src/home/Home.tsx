import "../styles/Home.css";
import Hero from "./Hero";
import LargeCard from "../cards/LargeCard";
import MediumCard from "../cards/MediumCard";
import SmallCard from "../cards/SmallCard";
import Footer from "./Footer";

function Home() {
  return (
    <>
      <Hero />
      <main>
        <section id="projects">
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center" }}>Featured Projects</h1>
          <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
            Some of my favorites
          </p>
          <div className="card-holder">
            <LargeCard />
            <LargeCard />
            <LargeCard />
          </div>
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center", marginTop: "var(--space-md)" }}>All Projects</h1>
          <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
            Some more great ones
          </p>
          <div className="card-holder">
            <MediumCard />
            <MediumCard />
          </div>
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center", marginTop: "var(--space-md)" }}>Junk Yard</h1>
          <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
            Just some treasures and trinkets
          </p>
          <div style={{ marginBottom: "var(--space-md)" }} className="card-holder">
            <SmallCard />
            <SmallCard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
