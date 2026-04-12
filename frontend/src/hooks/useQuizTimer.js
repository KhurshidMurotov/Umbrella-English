import { useEffect, useRef, useState } from "react";

export function useQuizTimer({ duration, questionKey, onExpire, isActive = true }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    setTimeLeft(duration);
    hasExpiredRef.current = false;
  }, [duration, questionKey]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    if (timeLeft <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire?.();
      return undefined;
    }

    if (timeLeft <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isActive, onExpire, timeLeft]);

  return timeLeft;
}
