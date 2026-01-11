import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Admin from './pages/Admin'
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import Projects from './pages/Projects';
import Project from './pages/Project';
import Zipline from './zipline/Zipline';
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
                <Route path="/projects/id/:id" element={<Project />} />
                <Route path="/projects/live/dev" element={<Zipline />} />
                <Route path="/junk" element={<Projects title='Junk Yard' projectType="junk" subheading='All the treasures and trinkets' />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
