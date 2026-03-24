import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useRef, useState, useLayoutEffect, Suspense, useEffect } from "react";
import "./App.css";
import {
  FaGithub,
  FaEnvelope,
  FaDiscord,
  FaTwitter,
  FaYoutube,
  FaMedium,
  FaInstagram,
  FaLinkedin,
  FaPlayCircle,
  FaFileDownload,
} from "react-icons/fa";

import * as THREE from "three";
import UnifiedTerminal from "./components/UnifiedTerminal";
import BoxModel from "./components/BoxModel";
import AnimatedBackground from "./components/AnimatedBackground";
import PortalOverlay from "./components/PortalOverlay";
import { PANEL_DESCRIPTIONS } from "./content/panelDescriptions";
import HackerText from "./components/HackerText";
import GlitchText from "./components/GlitchText";

import IconLink from "./components/IconLink";

export default function App() {
  /* =======================
     STATE
  ======================= */
  const RESUME_URL = "/resume.pdf";

  const [hoverLabel, setHoverLabel] = useState("");
  const [labelOpacity, setLabelOpacity] = useState(0);
  const [activePanel, setActivePanel] = useState(null);
  const [theme, setTheme] = useState("light");
  const content = PANEL_DESCRIPTIONS[activePanel];
  const links = content?.links || {};

  const [showIcons, setShowIcons] = useState(false);

  // Portal flow
  const [portalStage, setPortalStage] = useState("idle");
  // idle → connecting → connected → entering → collapsing → black → reveal
  const lastThemeRef = useRef(theme);

  const ICON_MAP = {
    prototype: FaPlayCircle,
    github: FaGithub,
    email: FaEnvelope,
    discord: FaDiscord,
    twitter: FaTwitter,
    youtube: FaYoutube,
    medium: FaMedium,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
  };

  /* TERMINAL LOG STATE */
  const [terminalLogs, setTerminalLogs] = useState([
    {
      id: Date.now(),
      text: "PS C:\Abhay> WELCOME TO THE PORTFOLIO",
      removing: false,
    },
  ]);
  const addTerminalLog = (text) => {
    const newLog = {
      id: Date.now(),
      text,
      removing: false,
    };

    setTerminalLogs((prev) => {
      const logs = [...prev, newLog];

      // keep max 10 logs
      if (logs.length > 6) {
        const oldest = logs[0];
        logs[0] = { ...oldest, removing: true };

        // remove AFTER fade animation
        setTimeout(() => {
          setTerminalLogs((current) =>
            current.filter((l) => l.id !== oldest.id),
          );
        }, 400);
      }

      return logs;
    });
  };

  /* BACKGROUND COLORS */
  const bgColor = useRef(new THREE.Color("#f2f4ff"));
  const targetBgColor = useRef(new THREE.Color("#f2f4ff"));

  useLayoutEffect(() => {
    targetBgColor.current.set(theme === "dark" ? "rgb(0, 0, 0)" : "#f2f4ff");
  }, [theme]);

  /* PORTAL SOUND */
  const portalSoundRef = useRef(null);

  useEffect(() => {
    portalSoundRef.current = new Audio("/sounds/portal-whoosh.mp3");
    portalSoundRef.current.volume = 0.7;
  }, []);

  useEffect(() => {
    setShowIcons(false);
  }, [activePanel]);

  const playPortalSound = () => {
    if (!portalSoundRef.current) return;
    portalSoundRef.current.currentTime = 0;
    portalSoundRef.current.play().catch(() => {});
  };

  /* PAGE IDENTITY */
  useEffect(() => {
    document.title = "Abhay — Portfolio";
  }, []);

  useEffect(() => {
    setShowIcons(false);
  }, [activePanel]);

  /* TERMINAL LOG TRACKER */
  useEffect(() => {
    if (portalStage !== "reveal") return;

    let location = "Idle";
    if (activePanel) {
      location = activePanel.replace("_Panel", "").replace(/_/g, "-");
    }

    addTerminalLog(`PS C:\Abhay> ${location}`);
  }, [activePanel, portalStage]);

  useEffect(() => {
    if (portalStage !== "reveal") return;
    if (lastThemeRef.current === theme) return;

    lastThemeRef.current = theme;
    addTerminalLog("PS C:\Abhay> STEPPING THROUGH PORTAL...");
  }, [theme, portalStage]);
  return (
    /*  STATIC BLACK BACKDROP */
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        overflow: "hidden",
      }}
    >
      {/*  SHAKING / COLLAPSING LAYER */}
      <div
        className={
          portalStage === "collapsing"
            ? "collapse"
            : portalStage === "black"
              ? "black-frame"
              : ""
        }
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {/* =======================
             3D SCENE
        ======================= */}
        <Canvas camera={{ position: [3, 3, 3], fov: 45 }}>
          <Suspense fallback={null}>
            <AnimatedBackground
              bgColor={bgColor}
              targetBgColor={targetBgColor}
              theme={theme}
            />

            <ambientLight intensity={theme === "dark" ? 0.35 : 0.7} />

            <directionalLight
              position={[5, 6, 5]}
              intensity={theme === "dark" ? 0.8 : 1}
            />

            <ContactShadows position={[0, -0.6, 0]} />

            {/* 🔓 Mount model ONLY after reveal */}
            {portalStage === "reveal" && (
              <BoxModel
                setHoverLabel={setHoverLabel}
                setLabelOpacity={setLabelOpacity}
                activePanel={activePanel}
                setActivePanel={setActivePanel}
                theme={theme}
                setTheme={setTheme}
                onPortalActivate={playPortalSound}
              />
            )}

            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={false}
            />
          </Suspense>
        </Canvas>

        {/* =======================
             PERMANENT TERMINAL LOG (NEW)
        ======================= */}
        {portalStage === "reveal" && (
  <UnifiedTerminal
    theme={theme}
    logs={terminalLogs}
    setLogs={setTerminalLogs}
  />
)}
        
        {/* PORTAL / TERMINAL OVERLAY */}
        <PortalOverlay
          stage={portalStage}
          onEnter={() => setPortalStage("connecting")}
          onConnected={() => {
            setPortalStage("connected");
            setTimeout(() => setPortalStage("entering"), 400);
          }}
          onReveal={() => {
            setPortalStage("collapsing");

            setTimeout(() => {
              setPortalStage("black");
            }, 600);

            setTimeout(() => {
              setPortalStage("reveal");
            }, 900);
          }}
          onPortalSound={playPortalSound}
        />

        {/* HOVER LABEL */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: `translateX(-50%) translateY(${16 * (1 - labelOpacity)}px)`,
            opacity: labelOpacity,
            fontSize: 22,
            fontWeight: 600,
            pointerEvents: "none",
            color: theme === "dark" ? "#f8fafc" : "#334155",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          {hoverLabel}
        </div>

        {/* DESCRIPTION TEXT */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 40,
            transform: activePanel
              ? "translateY(-50%) translateX(0)"
              : "translateY(-50%) translateX(120%)",
            transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
            zIndex: 5,
            pointerEvents: "auto",
            maxWidth: 420,
          }}
        >
          {content && (
            <>
              <GlitchText
                text={content.title}
                duration={700}
                randomGlitch
                minDelay={1000}
                maxDelay={2000}
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                  marginBottom: 12,
                }}
              />

              <HackerText
                key={activePanel}
                text={content.description}
                mode="scramble"
                speed={8}
                scrambleRounds={4}
                onComplete={() => {
                  setShowIcons(true);
                }}
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  fontFamily: "monospace",
                  color: theme === "dark" ? "#cbd5f5" : "#475569",
                  whiteSpace: "pre-wrap",
                }}
              />

              {showIcons && (
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: 20,
                  }}
                >
                  {Object.entries(links).map(([key, href], index) => {
                    const Icon = ICON_MAP[key];
                    if (!Icon) return null;

                    const sizeMultiplier =
                      key === "github"
                        ? 1.4
                        : key === "email"
                          ? 1.4
                          : key === "instagram"
                            ? 1.4
                            : key === "linkedin"
                              ? 1.4
                              : key === "prototype"
                                ? 1.4
                                : 1;

                    return (
                      <IconLink
                        key={key}
                        href={href}
                        icon={<Icon />}
                        theme={theme}
                        sizeMultiplier={sizeMultiplier}
                        glitch
                        delay={index * 80}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        {/* RESUME CTA */}
        {portalStage === "reveal" && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 60,
            }}
          >
            <IconLink
              href={RESUME_URL}
              icon={<FaFileDownload />}
              theme={theme}
              sizeMultiplier={1.4}
              glitch
              delay={200}
            />
          </div>
        )}

        {/* CSS ANIMATIONS */}
        <style>
          {`
            @keyframes vertical-collapse {
              from { clip-path: inset(0% 0% 0% 0%); }
              to   { clip-path: inset(50% 0% 50% 0%); }
            }

            .collapse {
              animation: vertical-collapse 0.55s
                cubic-bezier(0.4, 0, 0.2, 1) forwards;
              background: black;
            }

            .black-frame {
              background: black;
            }
          `}
        </style>
      </div>
    </div>
  );
}