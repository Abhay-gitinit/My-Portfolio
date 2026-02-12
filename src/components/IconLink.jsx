import { useState } from "react";

export default function IconLink({
  href,
  icon,
  theme,
  sizeMultiplier = 1,
  reveal = true,
  delay = 0,
  glitch = false,
}) {
  const [hovered, setHovered] = useState(false);

  if (!reveal) return null;

  // If .pdf then donwload it
  const isDownloadable =
    typeof href === "string" && href.toLowerCase().endsWith(".pdf");

  return (
    <a
      href={href}
      target={isDownloadable ? undefined : "_blank"}
      rel={isDownloadable ? undefined : "noopener noreferrer"}
      download={isDownloadable ? true : undefined}
      className={`
        icon-link
        ${glitch ? "icon-glitch-in" : ""}
        ${hovered ? "icon-glitch-hover" : ""}
      `}
      style={{
        animationDelay: `${delay}ms`,
        color: theme === "dark" ? "#22c55e" : "#0f172a",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="icon-inner"
        style={{
          fontSize: `${22 * sizeMultiplier}px`,
          filter:
            theme === "dark"
              ? "drop-shadow(0 0 8px rgba(34,197,94,0.8))"
              : "drop-shadow(0 0 6px rgba(15,23,42,0.35))",
        }}
      >
        {icon}
      </span>
    </a>
  );
}