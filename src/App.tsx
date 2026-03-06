import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Nav from "./components/Nav";
import LightDarkToggle from "./components/LightDarkToggle";
import Footer from "./components/Footer";

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Resume = lazy(() => import("./pages/Resume"));
const Projects = lazy(() => import("./pages/Projects"));
const Project = lazy(() => import("./pages/Project"));
const Zipline = lazy(() => import("./zipline/Zipline"));
const Converter = lazy(() => import("./chimp_converter/Converter"));
const JovanLang = lazy(() => import("./jovanlang/JovanLang"));
const SpellCaster = lazy(() => import("./spell-caster/SpellCaster"));
const PIM = lazy(() => import("./pim/Pim"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <>
      <Nav />
      <LightDarkToggle />
      <Suspense fallback={<div style={{ color: "white", padding: "2rem", textAlign: "center" }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/projects" element={<Projects title="All Projects" />} />
          {/* Projects have an id version which is a dead project and a live version which is a real time demo version*/}
          <Route path="/projects/id/:id" element={<Project />} />
          <Route
            path="/projects/live/6"
            element={
              <Project
                id={6}
                subHeading="An app for sharing text and files between two devices, but with encryption!"
                mainContent={<Zipline />}
              />
            }
          />
          <Route
            path="/projects/live/7"
            element={
              <Project
                id={7}
                subHeading="An app for converting images to different formats since every other website sucks."
                mainContent={<Converter />}
              />
            }
          />
          <Route
            path="/projects/live/8"
            element={<Project id={8} mainContent={<JovanLang />} />}
          />
          <Route
            path="/projects/live/9"
            element={<Project id={9} mainContent={<SpellCaster />} />}
          />
          <Route
            path="/projects/live/10"
            element={<Project id={10} mainContent={<PIM />} />}
          />
          {/* These are shortcut links to apps that are used frequently*/}
          <Route path="/zipline" element={<Zipline />} />
          <Route path="/converter" element={<Converter />} />
          <Route
            path="/junk"
            element={
              <Projects
                title="Junk Yard"
                projectType="junk"
                subheading="All the treasures and trinkets"
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
