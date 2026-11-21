import { Link } from "react-router-dom";
import "./NotFound.css";

// Shown for any address that matches no route.
export default function NotFound() {
  return (
    <div className="notfound_wrap">
      <h1 className="notfound_title">Page not found</h1>
      <p className="notfound_text">
        This page does not exist or may have moved.
      </p>
      <Link className="notfound_button" to="/">
        Back to home
      </Link>
    </div>
  );
}
