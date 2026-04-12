import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import LiveHubPage from "./pages/LiveHubPage";
import LiveRoomPage from "./pages/LiveRoomPage";
import TeacherPage from "./pages/TeacherPage";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/live" element={<LiveHubPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/live/:roomCode" element={<LiveRoomPage />} />
      </Routes>
    </AnimatePresence>
  );
}
