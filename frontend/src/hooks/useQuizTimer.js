import { useEffect, useState } from "react";

export function useQuizTimer({ duration, questionKey, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, questionKey]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onExpire]);

  return timeLeft;
}
