const RESULTS_KEY = "umbrella-quiz-results";

export function saveResult(result) {
  const existing = getResults();
  localStorage.setItem(RESULTS_KEY, JSON.stringify([result, ...existing].slice(0, 10)));
}

export function getResults() {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to parse quiz results from storage", error);
    return [];
  }
}
