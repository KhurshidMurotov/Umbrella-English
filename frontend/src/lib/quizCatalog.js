import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./api";
import { quizCatalog as staticCatalog } from "./quizzes";

// The live catalog = built-in sample tests + any teacher-created tests, served by the
// backend GET /api/quizzes. We always fall back to the static catalog when the backend
// is unreachable so the app still works offline / before the server is up.
export async function fetchQuizCatalog() {
  try {
    const response = await fetch(`${API_URL}/api/quizzes`);
    if (!response.ok) {
      return staticCatalog;
    }
    const data = await response.json();
    const quizzes = Array.isArray(data.quizzes) ? data.quizzes : [];
    return quizzes.length ? quizzes : staticCatalog;
  } catch {
    return staticCatalog;
  }
}

export async function fetchQuizById(id) {
  try {
    const response = await fetch(`${API_URL}/api/quizzes/${encodeURIComponent(id)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.quiz) {
        return data.quiz;
      }
    }
  } catch {
    // fall through to the static catalog
  }
  return staticCatalog.find((quiz) => quiz.id === id) ?? null;
}

export function useQuizCatalog() {
  const [quizzes, setQuizzes] = useState(staticCatalog);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await fetchQuizCatalog();
    setQuizzes(list);
    setLoading(false);
    return list;
  }, []);

  useEffect(() => {
    let active = true;
    fetchQuizCatalog().then((list) => {
      if (active) {
        setQuizzes(list);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { quizzes, loading, refresh };
}
