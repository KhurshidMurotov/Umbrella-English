import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import LiveHubPage from "./pages/LiveHubPage";
import LiveRoomPage from "./pages/LiveRoomPage";
import TeacherPage from "./pages/TeacherPage";
import TeacherStatsPage from "./pages/TeacherStatsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/live" element={<LiveHubPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/teacher/stats" element={<TeacherStatsPage />} />
        <Route path="/live/:roomCode" element={<LiveRoomPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
