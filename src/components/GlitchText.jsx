import { useEffect, useRef, useState } from "react"

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}<>?/\\|"

export default function GlitchText({
  text,
  duration = 600,
  randomGlitch = true,
  minDelay = 2000,
  maxDelay = 6000,
  style
}) {
  const [display, setDisplay] = useState(text)
  const [glitching, setGlitching] = useState(false)

  const originalTextRef = useRef(text)
  const timerRef = useRef(null)

  // 🔥 CORE GLITCH (full text, never cuts)
  const runGlitch = (frames = 8, intensity = 0.3) => {
    setGlitching(true)
    let frame = 0

    const interval = setInterval(() => {
      frame++

      if (frame >= frames) {
        clearInterval(interval)
        setDisplay(originalTextRef.current)
        setGlitching(false)
        return
      }

      const corrupted = originalTextRef.current
        .split("")
        .map((c) => {
          if (c === " ") return " "
          return Math.random() < intensity
            ? GLITCH_CHARS[
                Math.floor(Math.random() * GLITCH_CHARS.length)
              ]
            : c
        })
        .join("")

      setDisplay(corrupted)
    }, 40)
  }

  // 🧨 INTRO GLITCH (on text change)
  useEffect(() => {
    originalTextRef.current = text
    setDisplay(text)
    runGlitch(Math.floor(duration / 40), 0.4)
  }, [text, duration])

  // 🌀 RANDOM AMBIENT GLITCHES
  useEffect(() => {
    if (!randomGlitch) return

    const loop = () => {
      const delay =
        Math.random() * (maxDelay - minDelay) + minDelay

      timerRef.current = setTimeout(() => {
        runGlitch(5, 0.25) // subtle pulse
        loop()
      }, delay)
    }

    loop()
    return () => clearTimeout(timerRef.current)
  }, [randomGlitch, minDelay, maxDelay])

  return (
    <span
      style={{
        display: "block",
        fontFamily: "monospace",
        textShadow: glitching
          ? `
            1px 0 red,
            -1px 0 cyan,
            0 0 10px rgba(34,197,94,0.8)
          `
          : "none",
        transition: "text-shadow 0.2s ease",
        ...style
      }}
    >
      {display}
    </span>
  )
}