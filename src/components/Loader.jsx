import { Html, useProgress } from "@react-three/drei"

export default function Loader() {
  const { active, progress } = useProgress()

  return (
    active && (
      <Html center>
        <div
          style={{
            padding: "24px 32px",
            borderRadius: "14px",
            background: "rgba(15,15,30,0.85)",
            color: "#e5e7eb",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: 0.5,
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.2)",
              borderTopColor: "#6b7cff",
              animation: "spin 1s linear infinite"
            }}
          />

          <span>{Math.floor(progress)}%</span>

          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </Html>
    )
  )
}