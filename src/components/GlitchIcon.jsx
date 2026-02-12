export default function GlitchIcon({ href, children, delay = 0 }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="icon-glitch-in"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </a>
  );
}
