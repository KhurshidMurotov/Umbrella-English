const TEACHER_SESSION_KEY = "umbrella-teacher-session";
const TEACHER_USERNAME = import.meta.env.VITE_TEACHER_USERNAME || "admin";
const TEACHER_PASSWORD = import.meta.env.VITE_TEACHER_PASSWORD || "teacher";

export function getTeacherSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(TEACHER_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function loginTeacher({ username, password }) {
  const valid =
    username.trim().toLowerCase() === TEACHER_USERNAME &&
    password === TEACHER_PASSWORD;

  if (!valid || typeof window === "undefined") {
    return null;
  }

  const session = {
    username: TEACHER_USERNAME,
    accessCode: TEACHER_PASSWORD
  };

  window.sessionStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logoutTeacher() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(TEACHER_SESSION_KEY);
}
