import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import "./styles/index.css";

const LINKS = [
    { label: "Home", href: "/" },
    { label: "About Me", href: "/about" },
    { label: "Contact Me", href: "/contact" },
    { label: "Résumé", href: "/resume" },
    { label: "Projects", href: "/projects" },
    { label: "Junk Yard", href: "/junk" },
];

const SOCIALS = [
    { label: <FaGithub size={35} />, href: "/" },
    { label: <FaLinkedin size={35} />, href: "/" },
    { label: <FaTwitter size={35} />, href: "/" },
];

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer>
            <section>
                <div>
                    <h1>Socials</h1>
                    <div style={{ display: "flex" }}>
                        {SOCIALS.map((media) => (
                            <a
                                key={media.href}
                                href={media.href}
                                style={{ color: "white", marginRight: "5px" }}
                            >
                                {media.label}
                            </a>
                        ))}
                    </div>
                </div>
                <div>
                    <h1>Links</h1>
                    <ul>
                        {LINKS.map((link) => (
                            <li>
                                <a
                                    key={link.href}
                                    href={link.href}
                                    style={{ color: "white" }}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <p id="copyright">
                    © {year} Jovan Stosic. All rights reserved.
                </p>
            </section>
        </footer>
    );
}

export default Footer;
