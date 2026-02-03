import { useEffect, useRef, useState } from "react"

const PROMPT = "PS C:\Abhay> "
const GREEN = "#22c55e"
const YELLOW = "#facc15"

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}<>?/\\|"

export default function PortalOverlay({
  stage,
  onEnter,
  onConnected,
  onReveal
}) {
  if (stage === "collapsing" || stage === "black" || stage === "reveal") {
    return null
  }

  const [locked, setLocked] = useState(false)
  const [lines, setLines] = useState([])
  const [glitchOut, setGlitchOut] = useState(false)

  const lockSoundRef = useRef(null)

  const wait = (ms) => new Promise((r) => setTimeout(r, ms))

  /* =======================
     FAST SCRAMBLED TYPE-IN
     (1.8x speed)
  ======================= */
  const typeLine = async (text, color) => {
    let visible = ""
    let charCount = 0
    let lineIndex

    setLines((prev) => {
      lineIndex = prev.length
      return [...prev, { text: "", color }]
    })

    await wait(0)

    for (let i = 0; i < text.length; i++) {
      // tighter scramble burst
      for (let s = 0; s < 2; s++) {
        const scrambled =
          visible +
          GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]

        setLines((prev) =>
          prev.map((l, idx) =>
            idx === lineIndex ? { ...l, text: scrambled } : l
          )
        )

        await wait(7) // ⬅️ was 12ms
      }

      visible += text[i]
      charCount++

      // 🔊 key-lock every 4 chars
      if (charCount % 4 === 0 && lockSoundRef.current) {
        lockSoundRef.current.currentTime = 0
        lockSoundRef.current.play().catch(() => {})
      }

      setLines((prev) =>
        prev.map((l, idx) =>
          idx === lineIndex ? { ...l, text: visible } : l
        )
      )

      await wait(10) // ⬅️ was 18ms
    }
  }

  /* =======================
     TERMINAL SEQUENCE
  ======================= */
  useEffect(() => {
    if (stage === "connecting") {
      setLines([])
      setGlitchOut(false)

      ;(async () => {
        await typeLine("CONNECTION TO PORTAL : PENDING", YELLOW)
        await wait(200)

        await typeLine("CONNECTION TO PORTAL : SUCCESSFUL", GREEN)
        await wait(300)

        onConnected?.()
      })()
    }

    if (stage === "entering") {
      ;(async () => {
        await typeLine("SYSTEM ONLINE", GREEN)
        await wait(200)

        await typeLine("IDENTITY CONFIRMED : ABHAY", GREEN)

        await wait(400) // cursor blink pause

        // 💥 global glitch-out
        setGlitchOut(true)

        await wait(225)
        onReveal?.()
      })()
    }
  }, [stage])

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
          fontFamily: "ui-monospace, monospace",
          pointerEvents: stage === "idle" ? "auto" : "none"
        }}
      >
        {stage === "idle" && (
          <button
            disabled={locked}
            onClick={() => {
              setLocked(true)
              onEnter?.()
            }}
            style={{
              padding: "18px 44px",
              fontSize: 16,
              letterSpacing: 2,
              fontWeight: 600,
              cursor: "pointer",
              color: GREEN,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.6)",
              borderRadius: 12,
              boxShadow: "0 0 30px rgba(34,197,94,0.4)"
            }}
          >
            ENTER THE PORTAL
          </button>
        )}

        {stage !== "idle" && (
          <div
            className={glitchOut ? "terminal-glitch-out" : ""}
            style={{
              fontSize: 17,
              lineHeight: 1.4,
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}
          >
            {lines.map((line, i) => (
              <div key={i} style={{ color: line.color }}>
                {PROMPT}
                {line.text}
                {i === lines.length - 1 && !glitchOut && (
                  <span
                    className="cursor"
                    style={{
                      marginLeft: 6,
                      animation: "blink 1s steps(1) infinite"
                    }}
                  >
                    ▮
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <audio
        ref={lockSoundRef}
        src="/sounds/key-lock.mp3"
        preload="auto"
      />
    </>
  )
}