import { useEffect, useRef, useState } from "react";

export function useAntiCheat({ enabled = true, onAutoSubmit } = {}) {
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState("");
  const [disqualified, setDisqualified] = useState(false);
  const lastViolationRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function registerViolation(reason) {
      const now = Date.now();
      if (now - lastViolationRef.current < 1200) {
        return;
      }

      lastViolationRef.current = now;

      setViolations((current) => {
        const next = current + 1;
        if (next > 3) {
          setDisqualified(true);
          setWarning("Exam ended automatically because anti-cheat violations exceeded the limit.");
          onAutoSubmit?.(reason, next);
        } else if (next > 2) {
          setWarning("Warning: one more tab, app switch or focus loss will end the quiz.");
        } else {
          setWarning(`Violation detected: ${reason}. Stay on this screen to continue.`);
        }
        return next;
      });
    }

    function handleVisibility() {
      if (document.hidden) {
        registerViolation("tab or app switched");
      }
    }

    function handleBlur() {
      registerViolation("window lost focus");
    }

    function handlePageHide() {
      registerViolation("page hidden or app minimized");
    }

    function handleFreeze() {
      registerViolation("browser moved to background");
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("freeze", handleFreeze);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("freeze", handleFreeze);
    };
  }, [enabled, onAutoSubmit]);

  return { violations, warning, disqualified };
}
