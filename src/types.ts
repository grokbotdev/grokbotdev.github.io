export type Role = "official" | "supervisor" | "admin";

export type GameStatus = "draft" | "submitted";

export type CrewPosition = "R" | "U1" | "U2" | "Alternate";

export type Half = "1st" | "2nd" | "OT";

export type CourtPosition = "Lead" | "Center" | "Trail";

export type DecisionCode = "CC" | "IC" | "NCC" | "NCI" | "INC";

export type VideoProcessingStatus =
  | "empty"
  | "attached"
  | "queued"
  | "processing"
  | "ready"
  | "failed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface CrewAssignment {
  position: CrewPosition;
  userId: string | null;
  name: string;
}

export interface GameVideo {
  id: string;
  slot: 1 | 2 | 3 | 4;
  description: string;
  playType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  processingStatus: VideoProcessingStatus;
  /** Demo-only in-memory preview; never persisted. */
  localPreviewUrl?: string;
  storagePath?: string;
  remoteUrl?: string;
}

export interface FourMinuteLine {
  id: string;
  half: Half | "";
  gameClock: string;
  positions: CourtPosition[];
  officialIds: string[];
  decision: DecisionCode | "";
  playType: string;
  explanation: string;
  videoId?: string;
}

/** Flattened library row — filter dimensions are first-class, not nested lookups. */
export interface LibraryClip {
  gameId: string;
  videoId: string;
  slot: 1 | 2 | 3 | 4;
  playType: string;
  description: string;
  fileName: string;
  fileSize: number;
  processingStatus: VideoProcessingStatus;
  homeTeam: string;
  visitorTeam: string;
  date: string;
}

export interface LibraryFilters {
  text: string;
  playType: string;
  team: string;
}

export const COURT_POSITIONS: CourtPosition[] = ["Lead", "Center", "Trail"];

export const EMPTY_LIBRARY_FILTERS: LibraryFilters = {
  text: "",
  playType: "",
  team: "",
};

export interface SupervisorComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  target: { type: "video" | "fourMinLine"; id: string };
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  videoRefs: { gameId: string; videoId: string }[];
  createdAt: string;
}

export interface Game {
  id: string;
  status: GameStatus;
  date: string;
  home: string;
  visitor: string;
  homeScore: number;
  visitorScore: number;
  overtime: boolean;
  crew: CrewAssignment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  videos: GameVideo[];
  fourMinuteLines: FourMinuteLine[];
  adminNotes: string;
  comments: SupervisorComment[];
}

export const UPLOAD_PLAY_TYPES = [
  "Block/Charge",
  "Foul (personal)",
  "Foul (technical)",
  "Travel",
  "Double dribble",
  "Out of bounds",
  "Goaltending/BI",
  "Shot clock",
  "Other",
] as const;

export const FOUR_MIN_PLAY_TYPES = [
  "Block/Charge",
  "Foul",
  "Travel",
  "OOB",
  "Coverage/positioning",
  "Other",
] as const;

export const DECISION_LABELS: Record<DecisionCode, string> = {
  CC: "Correct call",
  IC: "Incorrect call",
  NCC: "No-call correct",
  NCI: "No-call incorrect",
  INC: "Inconclusive",
};

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
