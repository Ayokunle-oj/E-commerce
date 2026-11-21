import { BRAND_NAME } from "../../data/brand";
import "./footer.css";

function Footer() {
  return (
    <div className="footer_container">
      © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
    </div>
  );
}

export default Footer;
