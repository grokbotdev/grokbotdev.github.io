import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GameDetailPage } from "./pages/GameDetailPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { LoginPage } from "./pages/LoginPage";
import { NewGamePage } from "./pages/NewGamePage";
import { PlaylistsPage } from "./pages/PlaylistsPage";
import { ReportsPage } from "./pages/ReportsPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route element={<ProtectedRoute roles={["official"]} />}>
            <Route path="games/new" element={<NewGamePage />} />
          </Route>
          <Route path="games/:gameId" element={<GameDetailPage />} />
          <Route element={<ProtectedRoute roles={["supervisor"]} />}>
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["admin", "supervisor"]} />}>
            <Route path="library" element={<LibraryPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="playlists" element={<PlaylistsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
