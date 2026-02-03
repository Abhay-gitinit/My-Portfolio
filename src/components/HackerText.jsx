import { useEffect, useRef, useState } from "react"

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:,.<>/?"

export default function HackerText({
  text,
  speed = 30,
  scrambleRounds = 8,
  style,
  onComplete
}) {
  const [output, setOutput] = useState("")
  const [scramblingIndex, setScramblingIndex] = useState(-1)

  const frame = useRef(0)
  const index = useRef(0)
  const intervalRef = useRef(null)
  const lockSoundRef = useRef(null)

  useEffect(() => {
    // preload lock sound
    lockSoundRef.current = new Audio("/sounds/key-lock.mp3")
    lockSoundRef.current.volume = 0.25
  }, [])

  useEffect(() => {
    setOutput("")
    frame.current = 0
    index.current = 0
    setScramblingIndex(-1)

    intervalRef.current = setInterval(() => {
      setOutput(() => {
        if (index.current >= text.length) {
          clearInterval(intervalRef.current)
          setScramblingIndex(-1)

          if (onComplete) {
    onComplete()
  }

          return text
        }

        let result = ""

        for (let i = 0; i < text.length; i++) {
          if (i < index.current) {
            result += text[i]
          } else if (i === index.current) {
            setScramblingIndex(i)

            if (frame.current < scrambleRounds) {
              result += CHARS[Math.floor(Math.random() * CHARS.length)]
            } else {
              // 🔊 play lock sound
              if ((index.current + 1) % 3 === 0 && lockSoundRef.current) {
                lockSoundRef.current.currentTime = 0
                lockSoundRef.current.play().catch(() => {})
              }

              result += text[i]
              frame.current = 0
              index.current++
            }
          } else {
            result += " "
          }
        }

        frame.current++
        return result
      })
    }, speed)

    return () => clearInterval(intervalRef.current)
  }, [text, speed, scrambleRounds])

  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {output.split("").map((char, i) => (
        <span
          key={i}
          style={{
            color:
              i === scramblingIndex ? "#22c55e" : style?.color,
            textShadow:
              i === scramblingIndex
                ? "0 0 8px rgba(34,197,94,0.8)"
                : "none",
            transition: "color 0.15s linear"
          }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}