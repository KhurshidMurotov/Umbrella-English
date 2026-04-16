import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_VIOLATION_LIMIT = 2;
const VIOLATION_BURST_WINDOW_MS = 900;

function readStoredState(storageKey) {
  if (!storageKey) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredState(storageKey, state) {
  if (!storageKey) {
    return;
  }

  try {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

function buildWarning({ reason, count, violationLimit }) {
  if (count >= violationLimit) {
    return "Exam ended automatically because anti-cheat violations reached the limit.";
  }

  if (count === violationLimit - 1) {
    return "Warning: one more tab, app switch or focus loss will lock the exam.";
  }

  return `Violation detected: ${reason}. Stay on this screen to continue.`;
}

export function useAntiCheat({
  enabled = true,
  onAutoSubmit,
  storageKey,
  violationLimit = DEFAULT_VIOLATION_LIMIT
} = {}) {
  const restoredState = readStoredState(storageKey);
  const [violations, setViolations] = useState(restoredState?.violations ?? 0);
  const [warning, setWarning] = useState(restoredState?.warning ?? "");
  const [disqualified, setDisqualified] = useState(Boolean(restoredState?.disqualified));
  const lastViolationRef = useRef(restoredState?.lastViolationAt ?? 0);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const storedState = readStoredState(storageKey);
    setViolations(storedState?.violations ?? 0);
    setWarning(storedState?.warning ?? "");
    setDisqualified(Boolean(storedState?.disqualified));
    lastViolationRef.current = storedState?.lastViolationAt ?? 0;
    autoSubmittedRef.current = false;
  }, [storageKey]);

  useEffect(() => {
    writeStoredState(storageKey, {
      violations,
      warning,
      disqualified,
      lastViolationAt: lastViolationRef.current
    });
  }, [disqualified, storageKey, violations, warning]);

  const lockExam = useCallback((reason, count, shouldSubmit = false) => {
    const normalizedCount = Math.max(count, violationLimit);
    setViolations((current) => Math.max(current, normalizedCount));
    setDisqualified(true);
    setWarning(buildWarning({ reason, count: normalizedCount, violationLimit }));

    if (shouldSubmit && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      onAutoSubmit?.(reason, normalizedCount);
    }
  }, [onAutoSubmit, violationLimit]);

  const forceDisqualify = useCallback((reason = "anti-cheat limit reached", count = violationLimit) => {
    lockExam(reason, count, false);
  }, [lockExam, violationLimit]);

  useEffect(() => {
    if (!enabled || disqualified) {
      return undefined;
    }

    function registerViolation(reason) {
      const now = Date.now();
      if (now - lastViolationRef.current < VIOLATION_BURST_WINDOW_MS) {
        return;
      }

      lastViolationRef.current = now;

      setViolations((current) => {
        const next = current + 1;
        if (next >= violationLimit) {
          lockExam(reason, next, true);
        } else {
          setWarning(buildWarning({ reason, count: next, violationLimit }));
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
  }, [disqualified, enabled, lockExam, violationLimit]);

  return {
    violations,
    warning,
    disqualified,
    forceDisqualify
  };
}
