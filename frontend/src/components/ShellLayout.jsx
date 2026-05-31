import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function ShellLayout({ children, showNav = true, showLinks = true }) {
  const location = useLocation();
  const links = [
    { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { to: "/live", label: "Join", icon: "🎯" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-yellow-50 px-3 py-3 sm:px-5 sm:py-4"
    >
      <div className="mx-auto max-w-6xl">
        {showNav ? (
          <nav
            className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-neutral-900 px-4 py-3 shadow-lg sm:mb-5 sm:rounded-3xl sm:px-5 sm:py-3.5"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              className="text-base font-black tracking-tight text-yellow-400 transition hover:text-yellow-300 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg px-1 sm:text-lg"
            >
              ☂ Umbrella English
            </Link>
            <div className="flex gap-1.5 sm:gap-2">
              {showLinks && links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 sm:px-4 sm:text-sm ${
                      isActive
                        ? "bg-yellow-400 text-neutral-900"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <span className="mr-1">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}
        {children}
      </div>
    </motion.div>
  );
}
