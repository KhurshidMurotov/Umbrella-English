import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function ShellLayout({ children, showNav = true }) {
  const location = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/live", label: "Join" }
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-full border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <Link to="/" className="text-lg font-extrabold tracking-tight text-neutral-950">
              Umbrella English
            </Link>
            <nav className="flex flex-wrap items-center gap-2">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      isActive ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-amber-100 hover:text-neutral-950"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
        {children}
      </div>
    </motion.div>
  );
}
