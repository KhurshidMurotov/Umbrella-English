import { motion } from "framer-motion";

function splitText(text) {
  return text.split("").map((char, index) => ({
    id: `${char}-${index}`,
    char,
    delay: index * 0.018
  }));
}

export default function FallingLettersOverlay({
  title = "Cheating detected",
  subtitle = "Your exam was locked because anti-cheat detected suspicious behavior."
}) {
  const titleLetters = splitText(title);
  const subtitleLetters = splitText(subtitle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-neutral-950/96 px-6 text-center text-white">
      <div className="max-w-4xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-neutral-950">
            Anti-Cheat Triggered
          </div>
        </div>

        <h1 className="flex flex-wrap justify-center text-4xl font-extrabold sm:text-6xl">
          {titleLetters.map((item) => (
            <motion.span
              key={item.id}
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{ y: 260, rotate: 18 - (item.delay * 40), opacity: 0 }}
              transition={{ duration: 1.6, delay: item.delay, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              {item.char === " " ? "\u00A0" : item.char}
            </motion.span>
          ))}
        </h1>

        <p className="mt-6 flex flex-wrap justify-center text-base text-neutral-300 sm:text-lg">
          {subtitleLetters.map((item) => (
            <motion.span
              key={item.id}
              initial={{ y: 0, rotate: 0, opacity: 0.95 }}
              animate={{ y: 220, rotate: -14 + (item.delay * 22), opacity: 0 }}
              transition={{ duration: 1.8, delay: 0.3 + item.delay, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              {item.char === " " ? "\u00A0" : item.char}
            </motion.span>
          ))}
        </p>
      </div>
    </div>
  );
}
