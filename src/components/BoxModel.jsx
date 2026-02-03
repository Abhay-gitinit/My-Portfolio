import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useRef, useLayoutEffect } from "react"
import * as THREE from "three"

import { VortexMaterial } from "../shaders/VortexMaterial"
import { ICON_COLORS } from "../utils/constants"
import {
  getHoverLabel,
  getTargetYRotation,
  computeFresnelIntensity
} from "../utils/helpers"

function BoxModel({
  setHoverLabel,
  setLabelOpacity,
  activePanel,
  setActivePanel,
  setTheme,
  theme,
  onPortalActivate
}) {
  /* =========================
     REFS
  ========================= */
  const group = useRef()
  const portalVortex = useRef()
  const cageGlass = useRef()
  const energyBall = useRef()

  const iconMeshes = useRef([])

  const hoveredName = useRef(null)
  const selectedPanel = useRef(null)
  const labelOpacity = useRef(0)

  const hasMaterialized = useRef(false)

  const targetQuat = useRef(new THREE.Quaternion())
  const tempEuler = useRef(new THREE.Euler())

  /* 🔥 SHAKE SYSTEM */
  const shakeTime = useRef(0)
  const shakeDuration = useRef(0)
  const shakeStrength = useRef(0)

  const baseGroupPos = useRef(new THREE.Vector3())
  const baseEnergyPos = useRef(new THREE.Vector3())

  /* 🔒 StrictMode guard (NEW – minimal fix) */
  const initialized = useRef(false)

  /* 🔄 PORTAL FLIP */
  const isFlipping = useRef(false)
  const flipProgress = useRef(0)
  const flipDuration = 0.9

  const suppressedHover = useRef(null)
  const labelVisibleUntil = useRef(0)
  const lastLabel = useRef(null)
  
  const { scene } = useGLTF("/models/box_portfolio.glb")

  /* =========================
     HELPERS
  ========================= */
  const getIconRoot = (name) => {
    if (!name) return null
    return name
      .replace("_Panel", "")
      .replace("_Icon", "")
      .replace("_Base", "")
      .replace("_Button", "")
      .replace("_Ribbon", "")
  }

  const shouldFloatIcon = (icon) => {
    const iconRoot = icon.userData.iconRoot

    if (selectedPanel.current) {
      return iconRoot === getIconRoot(selectedPanel.current)
    }

    if (!hoveredName.current) return false
    return iconRoot === getIconRoot(hoveredName.current)
  }

  /* =========================
     SETUP (ONCE)
  ========================= */
  useLayoutEffect(() => {
    /* 🔒 minimal fix: prevent double-run */
    if (initialized.current) return
    initialized.current = true

    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    scene.position.sub(center)

    /* ✅ minimal fix: store base position, do NOT mutate group */
    baseGroupPos.current.set(0, size.y - 0.3, 0)

    scene.traverse((obj) => {
      if (!obj.isMesh) return

      /* 🧊 BASE CUBE */
      if (obj.name === "Base_Cube") {
        cageGlass.current = obj
        obj.material = obj.material.clone()
        obj.material.transparent = true
        obj.material.opacity = 0.1
        obj.material.roughness = 0.25
        obj.material.metalness = 0.6
        obj.raycast = () => null
        return
      }

      /* ⚡ ENERGY BALL */
      if (obj.name === "Energy_Ball") {
        energyBall.current = obj
        obj.material = obj.material.clone()
        obj.material.emissive = new THREE.Color("#00ffcc")
        obj.material.emissiveIntensity = 20
        obj.material.roughness = 0.05
        baseEnergyPos.current.copy(obj.position)
        return
      }

      /* DEFAULT MATERIAL */
      obj.material = obj.material.clone()
      obj.material.roughness = 0.6
      obj.material.metalness = 0.05

      /* 🌌 PORTAL */
      if (
        obj.name.includes("Portal") ||
        obj.name.includes("Vortex") ||
        obj.name.includes("Ring")
      ) {
        obj.userData.isPortal = true

        if (obj.name === "Portal_Vortex") {
          obj.material = new VortexMaterial()
          obj.material.transparent = true
          obj.material.depthWrite = false
          obj.material.side = THREE.DoubleSide
          portalVortex.current = obj
        }
      }

      /* 🟦 PANELS */
      if (obj.name.endsWith("_Panel")) {
        obj.userData.isPanel = true
        obj.userData.panelName = obj.name
        obj.material.emissive.set("#ffffff")
        obj.material.emissiveIntensity = 0.36
      }

      /* 🟢 ICON PARTS */
      const ICON_PARTS = ["_Icon", "_Base", "_Button", "_Ribbon"]

      ICON_PARTS.forEach((part) => {
        if (obj.name.endsWith(part)) {
          obj.userData.iconRoot = getIconRoot(obj.name)
          obj.userData.basePosition = obj.position.clone()
          obj.userData.baseEmissiveIntensity = 0.6
          obj.material.metalness = 0
            obj.material.roughness = 0.15
            obj.material.toneMapped = false

          iconMeshes.current.push(obj)
        }
      })

      /* 🎨 ICON COLORS */
      if (ICON_COLORS[obj.name]) {
        obj.material.color.set(ICON_COLORS[obj.name])
        obj.material.emissive.set(ICON_COLORS[obj.name])
        obj.material.emissiveIntensity = 0.6
      }
    })
  }, [scene])

  /* =========================
     ANIMATION LOOP
  ========================= */
  useFrame(({ clock, camera }) => {
    /* ✅ minimal safety guard */
    if (!group.current) return

    const t = clock.elapsedTime

    /* 🌱 MATERIALIZE */
    if (!hasMaterialized.current) {
      group.current.scale.lerp(new THREE.Vector3(2.6, 2.6, 2.6), 0.08)
      if (group.current.scale.x > 2.55) hasMaterialized.current = true
      return
    }

    /* ⚡ ENERGY BALL */
    if (energyBall.current) {
      const pulse = Math.sin(t * 2.5) * 0.5 + 0.5
      energyBall.current.scale.setScalar(0.85 + pulse * 0.15)
      energyBall.current.material.emissiveIntensity = 18 + pulse * 8
      energyBall.current.rotation.y += 0.01
    }

    /* 🧊 FRESNEL */
    if (cageGlass.current) {
      const fresnel = computeFresnelIntensity(cageGlass.current, camera, 2)
      cageGlass.current.material.emissive.set("#00ffd5")
      cageGlass.current.material.emissiveIntensity = fresnel * 0.6
    }

    /* 🔄 PORTAL FLIP */
    let flipRotation = 0
    if (isFlipping.current) {
      flipProgress.current += 0.016
      const p = Math.min(flipProgress.current / flipDuration, 1)

      const eased =
        p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2

      flipRotation = eased * Math.PI * 2

      if (p >= 1) {
        isFlipping.current = false
        flipProgress.current = 0
      }
    }

    /* ⚡ SHAKE (unchanged) */
    if (shakeTime.current <= 0 && Math.random() < 0.005) {
      shakeDuration.current = THREE.MathUtils.randFloat(0.15, 0.35)
      shakeTime.current = shakeDuration.current
      shakeStrength.current = THREE.MathUtils.randFloat(0.015, 0.035)
    }

    const shake = new THREE.Vector3()
    if (shakeTime.current > 0) {
      shakeTime.current -= 0.016
      const decay = shakeTime.current / shakeDuration.current
      const strength = shakeStrength.current * decay
      shake.set(
        (Math.random() - 0.5) * strength,
        (Math.random() - 0.5) * strength,
        (Math.random() - 0.5) * strength
      )
    }

    /* 🎯 GROUP POSITION (original logic preserved) */
    const targetX = activePanel ? -1.6 : 0
    group.current.position.copy(baseGroupPos.current)
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      baseGroupPos.current.x + targetX,
      0.08
    )
    group.current.position.add(shake)

    /* ⚡ ENERGY BALL SHAKE */
    if (energyBall.current) {
      energyBall.current.position
        .copy(baseEnergyPos.current)
        .addScaledVector(shake, 1.5)
    }

    /* 🟢 ICON FLOAT + GLOW */
    iconMeshes.current.forEach((icon) => {
      const base = icon.userData.basePosition
      const baseEmissive = icon.userData.baseEmissiveIntensity

      if (shouldFloatIcon(icon)) {
        icon.position.y =
          base.y + Math.sin(t * 2) * 0.02 + 0.05

        const glow = Math.sin(t * 4) * 0.5 + 0.5
        icon.material.emissiveIntensity = THREE.MathUtils.lerp(
          icon.material.emissiveIntensity,
          baseEmissive + glow * .6,
          0.15
        )
      } else {
        icon.position.y = THREE.MathUtils.lerp(
          icon.position.y,
          base.y,
          0.12
        )

        icon.material.emissiveIntensity = THREE.MathUtils.lerp(
          icon.material.emissiveIntensity,
          baseEmissive,
          0.12
        )
      }
    })

    /* 🎯 ROTATION */
    if (selectedPanel.current) {
      const targetY = getTargetYRotation(selectedPanel.current)
      tempEuler.current.set(0, targetY + flipRotation, 0)
      targetQuat.current.setFromEuler(tempEuler.current)
      group.current.quaternion.slerp(targetQuat.current, 0.08)
      group.current.scale.lerp(new THREE.Vector3(3.2, 3.2, 3.2), 0.08)
    } else {
      group.current.rotation.y += 0.004 + flipRotation
      group.current.rotation.x += 0.002
      group.current.scale.lerp(new THREE.Vector3(2.3, 2.3, 2.3), 0.08)
    }

    /* 🌀 PORTAL VORTEX */
    if (portalVortex.current?.material?.uniforms) {
      portalVortex.current.material.uniforms.time.value += 0.015
    }

    /* 🏷️ LABEL */
    let label = null

// only allow label if this hover is not suppressed
if (hoveredName.current !== suppressedHover.current) {
  label = getHoverLabel(hoveredName.current)
}

if (hoveredName.current?.includes("Portal")) {
  label =
    theme === "dark"
      ? "TELEPORT TO LIGHT SIDE"
      : "TELEPORT TO DARK SIDE"
}

// ✅ start timer ONLY when label changes
if (label && label !== lastLabel.current) {
  labelVisibleUntil.current = clock.elapsedTime + 1
  lastLabel.current = label
}

// ✅ auto-hide after 2 seconds
if (label && clock.elapsedTime > labelVisibleUntil.current) {
  suppressedHover.current = hoveredName.current // 🔒 block respawn
  label = null
  lastLabel.current = null
}

    labelOpacity.current = THREE.MathUtils.lerp(
      labelOpacity.current,
      label ? 1 : 0,
      0.08
    )

    setHoverLabel(label)
    setLabelOpacity(labelOpacity.current)
  })

  /* =========================
     RENDER
  ========================= */
  return (
    <group ref={group} scale={0}>
      <primitive
        object={scene}
        onPointerOver={(e) => {
          e.stopPropagation()
          hoveredName.current = e.object.name
        }}
        onPointerOut={(e) => {
  if (!e.intersections.length) {
    hoveredName.current = null
    suppressedHover.current = null // 🔓 allow labels again
  }
}}
        onPointerMissed={() => {
          selectedPanel.current = null
          setActivePanel(null)
          setHoverLabel("")
          setLabelOpacity(0)
        }}
        onClick={(e) => {
          e.stopPropagation()

          if (e.object.userData.isPortal) {
            isFlipping.current = true
            flipProgress.current = 0
            onPortalActivate?.()
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
            return
          }

          if (!e.object.userData.isPanel) return
          selectedPanel.current = e.object.userData.panelName
          setActivePanel(e.object.userData.panelName)
        }}
      />
    </group>
  )
}

useGLTF.preload("/models/box_portfolio.glb")
export default BoxModel