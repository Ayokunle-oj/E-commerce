import { useState } from "react";
import { isSafeUrl } from "../../data/inputRules";
import "./avatar.css";

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: "md" | "lg" | "xl";
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => Array.from(part)[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

// A photo the customer just picked lives in the browser as a blob: address.
const canShow = (url: string) => url.startsWith("blob:") || isSafeUrl(url);

/** Profile picture, or initials when there is none or it fails to load. */
function Avatar({ name, url, size = "md" }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && canShow(url ?? "") && failedUrl !== url;

  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {showImage ? (
        <img
          className="avatar__image"
          src={url ?? undefined}
          alt=""
          onError={() => setFailedUrl(url ?? null)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export default Avatar;
