import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import "../styles/index.css";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "Contact Me", href: "/contact" },
  { label: "Résumé", href: "/resume" },
  { label: "Projects", href: "/projects" },
  { label: "Junk Yard", href: "/junk" },
];

const SOCIALS = [
  { label: <FaGithub size={40} />, href: "https://github.com/jovanstos" },
  {
    label: <FaLinkedin size={40} />,
    href: "https://www.linkedin.com/in/jovanstosic12/",
  },
  { label: <FaTwitter size={40} />, href: "https://x.com/jovanstos" },
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
                rel="noopener noreferrer"
                target="_blank"
                style={{ color: "white", marginRight: "5px" }}
              >
                {media.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h1>Links</h1>
          <ul style={{ listStyleType: "none", margin: "0", padding: "0" }}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} style={{ color: "white" }}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p id="copyright">© {year} Jovan Stosic. All rights reserved.</p>
      </section>
    </footer>
  );
}

export default Footer;
