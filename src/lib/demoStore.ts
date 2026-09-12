import { DEMO_USERS, SEED_GAMES, SEED_PLAYLISTS } from "../data/seed";
import type { CourtPosition, Game, LibraryClip, Playlist, PublicUser, SupervisorComment, User } from "../types";
import { createId } from "./ids";
import {
  canEditAdminNotes,
  canEditGameFields,
  canPostSupervisorComments,
  canSubmitGame,
  canViewGame,
  validateSubmit,
} from "./rules";

const STORAGE_KEY = "aeoa-pgr-demo-v2";

export type LibraryEntry = LibraryClip & { game: Game; video: Game["videos"][number] };

function migrateLine(line: Game["fourMinuteLines"][number] & { position?: string }): Game["fourMinuteLines"][number] {
  if (Array.isArray(line.positions)) return line;
  const legacy = line.position && line.position !== "" ? [line.position as CourtPosition] : [];
  const { position: _legacyPosition, ...rest } = line;
  return { ...rest, positions: legacy };
}

export type DemoState = {
  games: Game[];
  playlists: Playlist[];
};

function emptyVideos(): Game["videos"] {
  return ([1, 2, 3, 4] as const).map((slot) => ({
    id: createId("vid"),
    slot,
    description: "",
    playType: "",
    fileName: "",
    fileSize: 0,
    mimeType: "",
    processingStatus: "empty" as const,
  }));
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (Array.isArray(parsed.games) && Array.isArray(parsed.playlists)) {
        return {
          games: parsed.games.map((game) => ({
            ...game,
            fourMinuteLines: game.fourMinuteLines.map((line) => migrateLine(line)),
          })),
          playlists: parsed.playlists,
        };
      }
    }
  } catch {
    // fall through to seed
  }
  return { games: structuredClone(SEED_GAMES), playlists: structuredClone(SEED_PLAYLISTS) };
}

function persist(state: DemoState) {
  const serializable: DemoState = {
    games: state.games.map((game) => ({
      ...game,
      videos: game.videos.map(({ localPreviewUrl: _preview, ...video }) => video),
    })),
    playlists: state.playlists,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let state = typeof localStorage === "undefined" ? { games: [...SEED_GAMES], playlists: [...SEED_PLAYLISTS] } : loadState();
const listeners = new Set<() => void>();

function commit(next: DemoState) {
  state = next;
  persist(state);
  listeners.forEach((listener) => listener());
}

export function subscribeDemoStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoState(): DemoState {
  return state;
}

export function resetDemoStore() {
  commit({ games: structuredClone(SEED_GAMES), playlists: structuredClone(SEED_PLAYLISTS) });
}

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...pub } = user;
  return pub;
}

export function authenticateDemo(email: string, password: string): PublicUser | null {
  const user = DEMO_USERS.find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!user || user.password !== password) return null;
  return toPublicUser(user);
}

export function listOfficials(): PublicUser[] {
  return DEMO_USERS.filter((user) => user.role === "official").map(toPublicUser);
}

export function userById(id: string): PublicUser | undefined {
  const user = DEMO_USERS.find((candidate) => candidate.id === id);
  return user ? toPublicUser(user) : undefined;
}

export function gamesFor(user: PublicUser): Game[] {
  return state.games
    .filter((game) => canViewGame(user, game))
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
}

export function gameById(id: string): Game | undefined {
  return state.games.find((game) => game.id === id);
}

export function createGame(
  actor: PublicUser,
  draft: Omit<Game, "id" | "status" | "createdAt" | "updatedAt" | "videos" | "fourMinuteLines" | "adminNotes" | "comments" | "submittedAt"> & {
    videos?: Game["videos"];
    fourMinuteLines?: Game["fourMinuteLines"];
  },
): Game {
  if (actor.role !== "official") {
    throw new Error("Only officials can create games.");
  }
  const now = new Date().toISOString();
  const game: Game = {
    ...draft,
    id: createId("game"),
    status: "draft",
    createdBy: actor.id,
    createdAt: now,
    updatedAt: now,
    videos: draft.videos && draft.videos.length === 4 ? draft.videos : emptyVideos(),
    fourMinuteLines: draft.fourMinuteLines ?? [],
    adminNotes: "",
    comments: [],
  };
  commit({ ...state, games: [game, ...state.games] });
  return game;
}

export function updateGame(actor: PublicUser, gameId: string, patch: Partial<Game>): Game {
  const current = gameById(gameId);
  if (!current) throw new Error("Game not found.");
  if (!canEditGameFields(actor, current)) {
    throw new Error("This game is locked for your role.");
  }

  const next: Game = {
    ...current,
    ...patch,
    id: current.id,
    status: current.status,
    createdBy: current.createdBy,
    createdAt: current.createdAt,
    submittedAt: current.submittedAt,
    comments: current.comments,
    adminNotes: actor.role === "supervisor" ? (patch.adminNotes ?? current.adminNotes) : current.adminNotes,
    updatedAt: new Date().toISOString(),
  };

  if (current.status === "submitted" && actor.role !== "supervisor") {
    throw new Error("Submitted games can only be edited by a supervisor.");
  }
  if (current.status === "submitted") {
    next.crew = current.crew;
  }

  commit({
    ...state,
    games: state.games.map((game) => (game.id === gameId ? next : game)),
  });
  return next;
}

export function submitGame(actor: PublicUser, gameId: string): Game {
  const current = gameById(gameId);
  if (!current) throw new Error("Game not found.");
  if (!canSubmitGame(actor, current)) {
    throw new Error("Only a crew official can submit a draft.");
  }
  const errors = validateSubmit(current);
  if (errors.length) {
    throw new Error(errors.join(" "));
  }
  const now = new Date().toISOString();
  const next: Game = {
    ...current,
    status: "submitted",
    submittedAt: now,
    updatedAt: now,
    crew: current.crew,
  };
  commit({
    ...state,
    games: state.games.map((game) => (game.id === gameId ? next : game)),
  });
  return next;
}

export function setAdminNotes(actor: PublicUser, gameId: string, notes: string): Game {
  const current = gameById(gameId);
  if (!current) throw new Error("Game not found.");
  if (!canEditAdminNotes(actor)) {
    throw new Error("Only supervisors can write game admin notes.");
  }
  const next = { ...current, adminNotes: notes, updatedAt: new Date().toISOString() };
  commit({
    ...state,
    games: state.games.map((game) => (game.id === gameId ? next : game)),
  });
  return next;
}

export function addSupervisorComment(
  actor: PublicUser,
  gameId: string,
  target: SupervisorComment["target"],
  body: string,
): Game {
  const current = gameById(gameId);
  if (!current) throw new Error("Game not found.");
  if (!canPostSupervisorComments(actor)) {
    throw new Error("Only supervisors can post review comments.");
  }
  const comment: SupervisorComment = {
    id: createId("comment"),
    authorId: actor.id,
    body: body.trim(),
    createdAt: new Date().toISOString(),
    target,
  };
  const next = {
    ...current,
    comments: [...current.comments, comment],
    updatedAt: new Date().toISOString(),
  };
  commit({
    ...state,
    games: state.games.map((game) => (game.id === gameId ? next : game)),
  });
  return next;
}

export function createPlaylist(actor: PublicUser, name: string, description: string): Playlist {
  if (actor.role !== "admin") throw new Error("Only admins can manage playlists.");
  const playlist: Playlist = {
    id: createId("playlist"),
    name: name.trim(),
    description: description.trim(),
    videoRefs: [],
    createdAt: new Date().toISOString(),
  };
  commit({ ...state, playlists: [playlist, ...state.playlists] });
  return playlist;
}

export function addVideoToPlaylist(
  actor: PublicUser,
  playlistId: string,
  ref: { gameId: string; videoId: string },
): Playlist {
  if (actor.role !== "admin") throw new Error("Only admins can manage playlists.");
  const playlist = state.playlists.find((item) => item.id === playlistId);
  if (!playlist) throw new Error("Playlist not found.");
  const next = {
    ...playlist,
    videoRefs: playlist.videoRefs.some((item) => item.videoId === ref.videoId)
      ? playlist.videoRefs
      : [...playlist.videoRefs, ref],
  };
  commit({
    ...state,
    playlists: state.playlists.map((item) => (item.id === playlistId ? next : item)),
  });
  return next;
}

export function libraryVideos(): LibraryEntry[] {
  return state.games.flatMap((game) =>
    game.videos
      .filter((video) => video.fileName)
      .map((video) => ({
        gameId: game.id,
        videoId: video.id,
        slot: video.slot,
        playType: video.playType,
        description: video.description,
        fileName: video.fileName,
        fileSize: video.fileSize,
        processingStatus: video.processingStatus,
        homeTeam: game.home,
        visitorTeam: game.visitor,
        date: game.date,
        game,
        video,
      })),
  );
}

export { emptyVideos };
