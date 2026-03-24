import { useState } from "react";
import { TypingLine } from "../App"; // adjust if needed
import { runCommand } from "../utils/commands";
import PortalOverlay from "./PortalOverlay";

export default function TerminalUI({ theme }) {
  const [lines, setLines] = useState([
    "PS C:\\Abhay> WELCOME TO THE PORTFOLIO",
    "PS C:\\Abhay> Idle",
    "PS C:\\Abhay> AboutMe",
  ]);

  const [input, setInput] = useState("");

  const [uiState, setUIState] = useState({
    showCertificates: false,
  });

  // Handle command execution
  const handleCommand = (cmd) => {
    if (!cmd.trim()) return;

    const result = runCommand(cmd, setUIState);

    if (result === "__CLEAR__") {
      setLines([]);
      return;
    }

    setLines((prev) => [
      ...prev,
      `PS C:\\Abhay> ${cmd}`,
      result,
    ]);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* OUTPUT */}
      {lines.map((line, i) => (
        <TypingLine
          key={i}
          text={line}
          isLast={i === lines.length - 1}
          theme={theme}
        />
      ))}

      {/* INPUT LINE */}
      <div
        style={{
          display: "flex",
          fontFamily: "monospace",
          marginTop: 4,
        }}
      >
        <span>PS C:\Abhay&gt;</span>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCommand(input);
              setInput("");
            }
          }}
          autoFocus
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: theme === "dark" ? "#22c55e" : "#020617",
            marginLeft: 6,
            flex: 1,
            fontFamily: "monospace",
          }}
        />
      </div>

      {/* CERTIFICATES OVERLAY */}
      {uiState.showCertificates && (
        <PortalOverlay
          onClose={() =>
            setUIState((prev) => ({ ...prev, showCertificates: false }))
          }
        >
          <div style={{ textAlign: "center" }}>
            <h2>📜 My Certificates</h2>

            <p>Add your certificates here (images / cards)</p>

            <button
              onClick={() =>
                setUIState((prev) => ({
                  ...prev,
                  showCertificates: false,
                }))
              }
              style={{
                marginTop: 20,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </PortalOverlay>
      )}
    </div>
  );
}