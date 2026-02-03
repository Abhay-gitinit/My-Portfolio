// components/IconLink.jsx
import { useState } from "react"

export default function IconLink({
  href,
  icon,
  theme,
  sizeMultiplier = 1,
  reveal = true,
  delay = 0,
  glitch = false
}) {
  const [hovered, setHovered] = useState(false)

  if (!reveal) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        icon-link
        ${glitch ? "icon-glitch-in" : ""}
        ${hovered ? "icon-glitch-hover" : ""}
      `}
      style={{
        animationDelay: `${delay}ms`,
        color: theme === "dark" ? "#22c55e" : "#0f172a"
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
              : "drop-shadow(0 0 6px rgba(15,23,42,0.35))"
        }}
      >
        {icon}
      </span>
    </a>
  )
}