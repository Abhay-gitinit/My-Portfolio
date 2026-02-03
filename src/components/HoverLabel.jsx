export default function HoverLabel({ text, opacity, theme }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: `translateX(-50%) translateY(${16 * (1 - opacity)}px)`,
        opacity,
        fontSize: 22,
        fontWeight: 600,
        pointerEvents: "none",
        color: theme === "dark" ? "#f8fafc" : "#334155",
        transition:
          "opacity 0.25s ease, transform 0.25s ease, text-shadow 0.3s ease"
      }}
    >
      {text}
    </div>
  )
}