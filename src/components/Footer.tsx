import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import { SITE_LINKS } from "./siteLinks";
const socials = [
  { label: "GitHub", href: "https://github.com/jovanstos", icon: FaGithub },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jovanstosic12/",
    icon: FaLinkedin,
  },
  { label: "X / Twitter", href: "https://x.com/jovanstos", icon: FaTwitter },
];
export default function Footer() {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer>
      <section>
        <div>
          <h1>Socials</h1>
          <div className="footer-socials">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon size={45} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h1>Links</h1>
          <ul>
            {SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <p id="copyright">© {year} Jovan Stosic. All rights reserved.</p>
      </section>
    </footer>
  );
}
