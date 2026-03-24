import { createPortal } from "react-dom";
import { CERTIFICATES } from "../content/certificates";
import GlitchText from "./GlitchText";

export default function CertificateOverlay({ onClose }) {
  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <GlitchText
          text="📜 CERTIFICATE VAULT"
          style={titleStyle}
        />

        {/* GRID */}
        <div style={gridStyle}>
          {CERTIFICATES.map((cert, i) => (
            <div
              key={i}
              className="cert-card"
              style={{
                ...cardStyle,
                ...(cert.highlight ? highlightCard : {}),
              }}
              onClick={() => window.open(cert.file, "_blank")}
            >
              <div style={categoryStyle}>{cert.category}</div>
              <div style={certTitle}>{cert.title}</div>
              <div style={openHint}>CLICK TO VIEW</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <button onClick={onClose} style={closeBtn}>
          CLOSE TERMINAL
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ================= STYLES ================= */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.92)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  width: "80%",
  maxWidth: 900,
  padding: 30,
  background: "#050505",
  borderRadius: 14,
  boxShadow: "0 0 60px rgba(34,197,94,0.15)",
  color: "#22c55e",
  fontFamily: "monospace",
};

const titleStyle = {
  fontSize: 26,
  marginBottom: 20,
  textAlign: "center",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const cardStyle = {
  padding: 16,
  borderRadius: 10,
  background: "#0a0a0a",
  border: "1px solid rgba(34,197,94,0.2)",
  cursor: "pointer",
  transition: "all 0.25s ease",
};

const highlightCard = {
  border: "1px solid #22c55e",
  boxShadow: "0 0 10px rgba(34,197,94,0.2)",
};

const categoryStyle = {
  fontSize: 11,
  opacity: 0.6,
  marginBottom: 6,
};

const certTitle = {
  fontSize: 14,
  fontWeight: 600,
};

const openHint = {
  fontSize: 10,
  marginTop: 10,
  opacity: 0.5,
};

const closeBtn = {
  marginTop: 25,
  padding: "10px 18px",
  border: "1px solid #22c55e",
  background: "transparent",
  color: "#22c55e",
  cursor: "pointer",
};