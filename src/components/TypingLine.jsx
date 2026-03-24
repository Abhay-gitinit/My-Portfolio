import { useEffect, useState } from "react";

export default function TypingLine({ text, isLast, removing, theme }) {
  const [visible, setVisible] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isLast) {
      setVisible(text);
      return;
    }

    let i = 0;
    setVisible("");

    const interval = setInterval(() => {
      i++;
      setVisible(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 18);

    return () => clearInterval(interval);
  }, [text, isLast]);

  useEffect(() => {
    if (!isLast) return;
    const blink = setInterval(() => {
      setShowCursor((v) => !v);
    }, 500);
    return () => clearInterval(blink);
  }, [isLast]);

  return (
    <div
      className={removing ? "terminal-glitch-out" : ""}
      style={{
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        marginBottom: 4,
        color: theme === "dark" ? "#ffffff" : "#020617",
        textShadow:
          theme === "dark" ? "0 0 6px rgba(34,197,94,0.6)" : "none",
      }}
    >
      {visible}
      {isLast && showCursor && !removing && (
        <span style={{ marginLeft: 2 }}>▮</span>
      )}
    </div>
  );
}