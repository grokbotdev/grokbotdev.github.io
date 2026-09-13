import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  addSupervisorComment,
  addVideoToPlaylist,
  createGame,
  createPlaylist,
  gameById,
  gamesFor,
  getDemoState,
  libraryVideos,
  listOfficials,
  resetDemoStore,
  setAdminNotes,
  submitGame,
  subscribeDemoStore,
  updateGame,
  userById,
} from "../lib/demoStore";
import { canManagePlaylists, canViewLibrary } from "../lib/rules";
import type { Game, Playlist, PublicUser, SupervisorComment } from "../types";
import { useAuth } from "./AuthContext";

type AppDataContextValue = {
  games: Game[];
  playlists: Playlist[];
  officials: PublicUser[];
  library: ReturnType<typeof libraryVideos>;
  getGame: (id: string) => Game | undefined;
  lookupUser: (id: string) => PublicUser | undefined;
  createGame: (
    draft: Parameters<typeof createGame>[1],
  ) => Game;
  updateGame: (gameId: string, patch: Partial<Game>) => Game;
  submitGame: (gameId: string) => Game;
  setAdminNotes: (gameId: string, notes: string) => Game;
  addComment: (gameId: string, target: SupervisorComment["target"], body: string) => Game;
  createPlaylist: (name: string, description: string) => Playlist;
  addVideoToPlaylist: (playlistId: string, ref: { gameId: string; videoId: string }) => Playlist;
  resetDemo: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const snapshot = useSyncExternalStore(subscribeDemoStore, getDemoState, getDemoState);

  const value = useMemo<AppDataContextValue>(() => {
    const actor = user;
    const requireUser = (): PublicUser => {
      if (!actor) throw new Error("Sign in required.");
      return actor;
    };
    return {
      games: actor ? gamesFor(actor) : [],
      playlists: actor && canManagePlaylists(actor) ? snapshot.playlists : [],
      officials: listOfficials(),
      library: actor && canViewLibrary(actor) ? libraryVideos() : [],
      getGame: (id) => {
        const game = gameById(id);
        if (!game || !actor || !gamesFor(actor).some((item) => item.id === id)) return undefined;
        return game;
      },
      lookupUser: userById,
      createGame: (draft) => createGame(requireUser(), draft),
      updateGame: (gameId, patch) => updateGame(requireUser(), gameId, patch),
      submitGame: (gameId) => submitGame(requireUser(), gameId),
      setAdminNotes: (gameId, notes) => setAdminNotes(requireUser(), gameId, notes),
      addComment: (gameId, target, body) => addSupervisorComment(requireUser(), gameId, target, body),
      createPlaylist: (name, description) => createPlaylist(requireUser(), name, description),
      addVideoToPlaylist: (playlistId, ref) => addVideoToPlaylist(requireUser(), playlistId, ref),
      resetDemo: resetDemoStore,
    };
  }, [snapshot, user]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
