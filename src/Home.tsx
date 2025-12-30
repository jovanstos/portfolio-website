import "./styles/Home.css";
import Hero from "./Hero";

function Home() {
  return (
    <>
      <Hero />
      <main>
        <section id="projects">
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center" }}>Featured Projects</h1>
          <p style={{ fontSize: "var(--large)", textAlign: "center" }}>
            Some of my favorites
          </p>
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center", marginTop: "var(--space-md)" }}>All Projects</h1>
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center", marginTop: "var(--space-md)" }}>Junk Yard</h1>
        </section>
      </main>
      <footer>
        This is the a footer
      </footer>
    </>
  );
}

export default Home;
