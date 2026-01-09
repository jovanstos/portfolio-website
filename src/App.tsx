import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Admin from './pages/Admin'
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import Projects from './pages/Projects';
import Project from './pages/Project';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/projects" element={<Projects title='All Projects' />} />
            <Route path="/projects/id/:id" element={<Project />} />
            <Route path="/junk" element={<Projects title='Junk Yard' projectType="junk" subheading='All the treasures and trinkets' />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
