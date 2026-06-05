import { motion } from "framer-motion";
import { Target, Trophy, Umbrella } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function ShellLayout({ children, showNav = true, showLinks = true, fullBleed = false }) {
  const location = useLocation();
  const links = [
    { to: "/leaderboard", label: "Leaderboard", Icon: Trophy },
    { to: "/live", label: "Join", Icon: Target }
  ];

  function NavLinks({ activeClass, idleClass, ringClass }) {
    return (
      <div className="flex gap-1.5 sm:gap-2">
        {showLinks && links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition outline-none focus-visible:ring-2 sm:px-4 sm:text-sm ${ringClass} ${
                isActive ? activeClass : idleClass
              }`}
            >
              <link.Icon size={15} />
              {link.label}
            </Link>
          );
        })}
      </div>
    );
  }

  // Dark nav: a solid pill, used in boxed mode where it sits on the tinted page.
  const darkNav = showNav ? (
    <nav
      className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-neutral-900 px-4 py-3 shadow-lg sm:mb-6 sm:rounded-3xl sm:px-6 sm:py-4 lg:mb-8 lg:px-7"
      aria-label="Main navigation"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-base font-black tracking-tight text-yellow-400 transition hover:text-yellow-300 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg px-1 sm:text-lg"
      >
        <Umbrella size={20} strokeWidth={2.5} />
        Umbrella English
      </Link>
      <NavLinks
        activeClass="bg-yellow-400 text-neutral-900"
        idleClass="text-neutral-300 hover:bg-neutral-800 hover:text-white"
        ringClass="focus-visible:ring-yellow-400"
      />
    </nav>
  ) : null;

  // Light nav: transparent, dark text — sits on the white page, separate from the hero band.
  const lightNav = showNav ? (
    <nav className="flex items-center justify-between gap-3" aria-label="Main navigation">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-black transition hover:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-lg px-1 sm:text-xl"
      >
        <Umbrella size={22} strokeWidth={2.5} />
        Umbrella English
      </Link>
      <NavLinks
        activeClass="bg-neutral-900 text-white"
        idleClass="text-black hover:bg-black/10"
        ringClass="focus-visible:ring-neutral-900"
      />
    </nav>
  ) : null;

  // Full-bleed mode: sections paint their own edge-to-edge background bands; the page is
  // white with no side gutters. The transparent nav stays on white, separate from the hero.
  if (fullBleed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-6">{lightNav}</div>
        {children}
      </motion.div>
    );
  }

  // Boxed mode (default): everything sits in a centered container on a tinted page.
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-yellow-50 px-3 py-3 sm:px-6 sm:py-5 lg:px-10 lg:py-8"
    >
      <div className="mx-auto max-w-7xl">
        {darkNav}
        {children}
      </div>
    </motion.div>
  );
}
