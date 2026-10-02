import { Link } from "react-router-dom";
import Stars from "../components/Stars";
export default function NotFound() {
  return (
    <div
      style={{
        background: "#13141c",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stars speed={200} />
      <main
        id="not-found"
        style={{ position: "relative", padding: "96px 16px 48px", gap: 16 }}
      >
        <h1>404 Page Not found</h1>
        <h2 style={{ color: "white" }}>Looks like you're lost 🥲</h2>
        <Link className="primary-button button-link" to="/">
          Head Home
        </Link>
      </main>
    </div>
  );
}
