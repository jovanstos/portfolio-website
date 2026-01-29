import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Admin from './pages/Admin'
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import Projects from './pages/Projects';
import Project from './pages/Project';
import Zipline from './zipline/Zipline';
import Converter from "./chimp_converter/Converter"
import JovanLang from './jovanlang/JovanLang';
import NotFound from './pages/NotFound';
import Nav from "./components/Nav";
import LightDarkToggle from "./components/LightDarkToggle";
import Footer from "./components/Footer";

function App() {
    return (
        <>
            <Nav />
            <LightDarkToggle />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/projects" element={<Projects title='All Projects' />} />
                {/* Projects have an id version which is a dead project and a live version which is a real time demo version*/}
                <Route path="/projects/id/:id" element={<Project />} />
                <Route path="/projects/live/6" element={<Project id={6} subHeading='An app for sharing text and files between two devices, but with encryption!' mainContent={<Zipline />} />} />
                <Route path="/projects/live/7" element={<Project id={7} subHeading='An app for converting images to different formats since every other website sucks.' mainContent={<Converter />} />} />
                <Route path="/projects/live/8" element={<Project id={8} mainContent={<JovanLang />} />} />
                {/* These are shortcut links to apps that are used frequently*/}
                <Route path="/zipline" element={<Zipline />} />
                <Route path="/converter" element={<Converter />} />
                <Route path="/junk" element={<Projects title='Junk Yard' projectType="junk" subheading='All the treasures and trinkets' />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
