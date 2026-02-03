import { useFrame } from "@react-three/fiber"

export default function AnimatedBackground({
  bgColor,
  targetBgColor,
  theme
}) {
  useFrame(() => {
    const speed = theme === "light" ? 0.015 : 0.03
    bgColor.current.lerp(targetBgColor.current, speed)
  })

  return <primitive attach="background" object={bgColor.current} />
}