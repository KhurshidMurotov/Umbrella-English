import { motion } from "framer-motion";
import { Target, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function ShellLayout({ children, showNav = true, showLinks = true, fullBleed = false }) {
  const location = useLocation();
  const links = [
    { to: "/leaderboard", label: "Leaderboard", Icon: Trophy },
    { to: "/live", label: "Join", Icon: Target }
  ];

  const nav = showNav ? (
    <div className="band">
      <div className="container">
        <nav className="nav" aria-label="Main navigation">
          <Link to="/" className="brand">
            <img src="/umbrella-badge-yellow.svg" alt="" width={38} height={38} />
            Umbrella English
          </Link>
          {showLinks ? (
            <div className="navlinks">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={isActive ? "page" : undefined}
                    className={`nlink${isActive ? " active" : ""}`}
                  >
                    <link.Icon size={15} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </nav>
      </div>
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: "var(--paper)" }}
    >
      {nav}
      {fullBleed ? children : (
        <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
          {children}
        </div>
      )}
    </motion.div>
  );
}
