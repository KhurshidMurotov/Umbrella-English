import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function ShellLayout({ children, showNav = true }) {
  const location = useLocation();
  const links = [
    { to: "/", label: "Find Quiz", icon: "🔍" },
    { to: "/live", label: "Join Live", icon: "🎯" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen px-4 py-6 text-neutral-900 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {showNav ? (
          <nav className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-full border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur" aria-label="Main navigation">
            <Link to="/" className="text-lg font-extrabold tracking-tight text-neutral-950 hover:opacity-80 transition focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg px-2 py-1 outline-none">
              Umbrella English
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 outline-none ${
                      isActive
                        ? "bg-neutral-950 text-white shadow-md"
                        : "text-neutral-600 hover:bg-amber-100 hover:text-neutral-950"
                    }`}
                    title={link.label}
                  >
                    <span className="inline-block mr-1">{link.icon}</span>
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
