import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";
import Hero from "../components/Hero";
import LargeCard from "../cards/LargeCard";
import MediumCard from "../cards/MediumCard";
import SmallCard from "../cards/SmallCard";
import FadeInSection from "../components/FadeInSection";

function Home() {
  const navigate = useNavigate();

  const { data: regularData, isLoading: regularIsLoading } = useQuery({
    queryKey: ["projects", "regular"],
    queryFn: getProjects,
  });

  const { data: featuredData, isLoading: featuredIsLoading } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: getProjects,
  });

  const { data: junkData, isLoading: junkIsLoading } = useQuery({
    queryKey: ["projects", "junk"],
    queryFn: getProjects,
  });

  return (
    <>
      <Hero />
      <FadeInSection>
        <div id="home-info">
          <p id="home-info-text">
            <b>Real quick, </b>
            just a rundown of the site. The rocket ship in the top left is a
            spinable wheel with the navigation links. The sun/moon in the top
            right is to switch between light/dark mode. Also, this is a MEGA
            monolith app; it has multiple services and live projects. You can
            learn more about the app by going to the detailed explanation here:{" "}
            <a href="/" rel="noopener noreferrer">
              Project page.
            </a>
          </p>
        </div>
      </FadeInSection>
      <main id="home">
        <section className="home-projects">
          <h1 style={{ fontSize: "var(--xxlarge)", textAlign: "center" }}>
            Featured Projects
          </h1>
          <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
            Some of my favorites
          </p>
          <div className="card-holder">
            {featuredIsLoading ? (
              <p style={{ textAlign: "center" }}>
                Loading featured projects...
              </p>
            ) : (
              <div className="card-holder">
                {featuredData?.map((proj) => (
                  <FadeInSection key={proj.id}>
                    <LargeCard
                      id={proj.id}
                      title={proj.title}
                      description={proj.description}
                      imgURL={proj.imageurl}
                      imgDescription={proj.imagedescription}
                    />
                  </FadeInSection>
                ))}
              </div>
            )}
          </div>
          <FadeInSection>
            <h1
              style={{
                fontSize: "var(--xxlarge)",
                textAlign: "center",
                marginTop: "var(--space-md)",
              }}
            >
              All Projects
            </h1>
            <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
              Some more great ones
            </p>
            <div className="card-holder">
              {regularIsLoading ? (
                <p style={{ textAlign: "center" }}>Loading projects...</p>
              ) : (
                <div className="card-holder">
                  {regularData?.map((proj) => (
                    <FadeInSection key={proj.id}>
                      <MediumCard
                        id={proj.id}
                        title={proj.title}
                        description={proj.description}
                        imgURL={proj.imageurl}
                        imgDescription={proj.imagedescription}
                      />
                    </FadeInSection>
                  ))}
                </div>
              )}
            </div>
            <FadeInSection>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className="primary-button"
                  onClick={() => navigate("/projects")}
                >
                  See more
                </button>
              </div>
            </FadeInSection>
          </FadeInSection>
          <FadeInSection>
            <h1
              style={{
                fontSize: "var(--xxlarge)",
                textAlign: "center",
                marginTop: "var(--space-md)",
              }}
            >
              Junk Yard
            </h1>
            <p style={{ fontSize: "var(--medium)", textAlign: "center" }}>
              Just some treasures and trinkets
            </p>
            <div
              style={{ marginBottom: "var(--space-md)" }}
              className="card-holder"
            >
              {junkIsLoading ? (
                <p style={{ textAlign: "center" }}>Loading trinkets...</p>
              ) : (
                <div
                  style={{ marginBottom: "var(--space-md)" }}
                  className="card-holder"
                >
                  {junkData?.map((proj) => (
                    <FadeInSection key={proj.id}>
                      <SmallCard
                        id={proj.id}
                        title={proj.title}
                        description={proj.description}
                        imgURL={proj.imageurl}
                        imgDescription={proj.imagedescription}
                      />
                    </FadeInSection>
                  ))}
                </div>
              )}
            </div>
            <FadeInSection>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className="primary-button"
                  onClick={() => navigate("/junk")}
                >
                  See more
                </button>
              </div>
            </FadeInSection>
          </FadeInSection>
        </section>
      </main>
    </>
  );
}

export default Home;
