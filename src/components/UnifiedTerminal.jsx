import { useState, useRef } from "react";
import TypingLine from "./TypingLine";
import CertificateOverlay from "./CertificateOverlay";
import GlitchText from "./GlitchText";

/* =========================
   FAKE FILE SYSTEM
========================= */
const FILE_SYSTEM = {
  root: {
    about: {
      "me.txt": "I think in systems — how code flows, how visuals react.",
    },
    projects: {
      "hospital.txt": "Hospital Management System (React + Node)",
      "portfolio.txt": "3D Interactive Portfolio",
    },
    certificates: {
      "cert1.txt": "Web Dev Certificate",
      "cert2.txt": "Cybersecurity Basics",
    },
  },
};

export default function UnifiedTerminal({ theme, logs, setLogs }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState(["root"]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [glitch, setGlitch] = useState(null);

  const inputRef = useRef();

  /* =========================
     HELPERS
  ========================= */
  const getDir = () => {
    let dir = FILE_SYSTEM;
    cwd.forEach((p) => {
      dir = dir[p];
    });
    return dir;
  };

  const addLog = (text) => {
    setLogs((prev) => {
      const newLogs = [...prev, { id: Date.now(), text }];

      // limit to 7 logs
      if (newLogs.length > 7) {
        newLogs.shift(); // remove oldest
      }

      return newLogs;
    });
  };

  const runCommand = (cmd) => {
    const parts = cmd.trim().split(" ");
    const base = parts[0];

    /* ===== CLEAR ===== */
    if (base === "clear") {
      setLogs([]);
      return;
    }

    /* ===== HELP ===== */
    if (base === "/help") {
      addLog("=== COMMAND LIST ===");

      addLog("[ SYSTEM ]");
      addLog("/help → Show all commands");
      addLog("clear → Clear terminal");

      addLog("[ NAVIGATION ]");
      addLog("ls → List directory");
      addLog("cd <dir> → Enter folder");
      addLog("cd .. → Go back");

      addLog("[ FILES ]");
      addLog("cat <file> → Read file");

      addLog("[ PORTFOLIO ]");
      addLog("/certificates → Open vault");

      return;
    }

    /* ===== CERTIFICATES ===== */
    if (base === "/certificates") {
      setShowCertificates(true);
      addLog("Opening certificates...");
      return;
    }

    /* ===== LS ===== */
    if (base === "ls") {
      const dir = getDir();
      addLog(Object.keys(dir).join("   "));
      return;
    }

    /* ===== CD ===== */
    if (base === "cd") {
      const target = parts[1];

      if (!target) return;

      if (target === "..") {
        if (cwd.length > 1) {
          setCwd((prev) => prev.slice(0, -1));
        }
        return;
      }

      const dir = getDir();

      if (dir[target]) {
        setCwd((prev) => [...prev, target]);
      } else {
        triggerGlitch(`Directory not found: ${target}`);
      }
      return;
    }

    /* ===== CAT ===== */
    if (base === "cat") {
      const file = parts[1];
      const dir = getDir();

      if (dir[file]) {
        addLog(dir[file]);
      } else {
        triggerGlitch(`File not found: ${file}`);
      }
      return;
    }

    /* ===== UNKNOWN ===== */
    triggerGlitch(`Command not found: ${cmd}`);
  };

  /* =========================
     GLITCH EFFECT
  ========================= */
  const triggerGlitch = (text) => {
    setGlitch(text);
    setTimeout(() => setGlitch(null), 1200);
  };

  /* =========================
     KEY HANDLER
  ========================= */
  const handleKeyDown = (e) => {
    /* ENTER */
    if (e.key === "Enter") {
      if (!input.trim()) return;

      addLog(`PS C:\\Abhay> ${input}`);
      runCommand(input);

      setHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      setInput("");
    }

    /* ↑ HISTORY */
    if (e.key === "ArrowUp") {
      if (history.length === 0) return;

      const index =
        historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;

      setHistoryIndex(index);
      setInput(history[history.length - 1 - index]);
    }

    /* ↓ HISTORY */
    if (e.key === "ArrowDown") {
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput("");
        return;
      }

      const index = historyIndex - 1;
      setHistoryIndex(index);
      setInput(history[history.length - 1 - index]);
    }

    /* TAB AUTOCOMPLETE */
    if (e.key === "Tab") {
      e.preventDefault();

      const dir = getDir();
      const match = Object.keys(dir).find((k) => k.startsWith(input));

      if (match) setInput(match);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          width: "360px",
          maxHeight: "70vh",
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: 14,
          lineHeight: 1.4,
          color: theme === "dark" ? "#ffffff" : "#020617",
        }}
      >
        {/* LOGS */}
        {logs.map((log) => (
          <TypingLine key={log.id} text={log.text} theme={theme} />
        ))}

        {/* GLITCH ERROR */}
        {glitch && (
          <GlitchText text={glitch} style={{ color: "red", fontSize: 14 }} />
        )}

        {/* INPUT */}
        <div style={{ display: "flex" }}>
          <span>PS C:\{cwd.join("\\")}&gt;</span>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: theme === "dark" ? "#ffffff" : "#020617",
              marginLeft: 6,
              flex: 1,
              fontFamily: "monospace",
            }}
          />
        </div>
      </div>

      {showCertificates && (
        <CertificateOverlay onClose={() => setShowCertificates(false)} />
      )}
    </>
  );
}
