import type {
  FourMinuteLine,
  Game,
  GameVideo,
  PublicUser,
  Role,
} from "../types";

export function scoreMargin(game: Pick<Game, "homeScore" | "visitorScore">): number {
  return Math.abs(game.homeScore - game.visitorScore);
}

export function needsFourMinuteReport(
  game: Pick<Game, "overtime" | "homeScore" | "visitorScore">,
): boolean {
  return game.overtime || scoreMargin(game) <= 6;
}

const CLOCK_RE = /^(?:(\d{1,2}):)?([0-5]?\d)(?:\.(\d{1,2}))?$/;

export function isValidGameClock(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const match = CLOCK_RE.exec(trimmed);
  if (!match) return false;
  const minutes = match[1] === undefined ? undefined : Number(match[1]);
  const seconds = Number(match[2]);
  const hasDecimal = match[3] !== undefined;
  if (seconds > 59) return false;
  if (hasDecimal && minutes !== undefined && minutes >= 1) return false;
  return true;
}

export function isVideoComplete(video: GameVideo): boolean {
  return (
    video.fileName.trim().length > 0 &&
    video.fileSize > 0 &&
    video.fileSize <= 100 * 1024 * 1024 &&
    video.description.trim().length > 0 &&
    video.playType.trim().length > 0
  );
}

export function isFourMinuteLineComplete(line: FourMinuteLine): boolean {
  return (
    line.half !== "" &&
    isValidGameClock(line.gameClock) &&
    line.positions.length > 0 &&
    line.officialIds.length > 0 &&
    line.decision !== "" &&
    line.playType.trim().length > 0 &&
    line.explanation.trim().length > 0
  );
}

export function crewUserIds(game: Pick<Game, "crew">): string[] {
  return game.crew.map((seat) => seat.userId).filter((id): id is string => Boolean(id));
}

export function isOnCrew(user: PublicUser, game: Pick<Game, "crew" | "createdBy">): boolean {
  return game.createdBy === user.id || crewUserIds(game).includes(user.id);
}

export function canViewGame(user: PublicUser, game: Game): boolean {
  if (user.role === "supervisor" || user.role === "admin") return true;
  return isOnCrew(user, game);
}

export function canCreateGame(user: PublicUser): boolean {
  return user.role === "official";
}

export function canEditGameFields(user: PublicUser, game: Game): boolean {
  if (user.role === "supervisor") return true;
  if (user.role === "admin") return false;
  return game.status === "draft" && isOnCrew(user, game);
}

export function canSubmitGame(user: PublicUser, game: Game): boolean {
  return game.status === "draft" && user.role === "official" && isOnCrew(user, game);
}

export function canPostSupervisorComments(user: PublicUser): boolean {
  return user.role === "supervisor";
}

export function canEditAdminNotes(user: PublicUser): boolean {
  return user.role === "supervisor";
}

export function canViewLibrary(user: PublicUser): boolean {
  return user.role === "admin";
}

export function navForRole(role: Role): { to: string; label: string }[] {
  if (role === "official") {
    return [
      { to: "/", label: "My games" },
      { to: "/games/new", label: "New game" },
    ];
  }
  if (role === "supervisor") {
    return [
      { to: "/", label: "All games" },
      { to: "/reports", label: "Reports" },
    ];
  }
  return [
    { to: "/", label: "Games" },
    { to: "/library", label: "Video library" },
    { to: "/playlists", label: "Playlists" },
  ];
}

export function validateSubmit(game: Game): string[] {
  const errors: string[] = [];
  const requiredSeats = game.crew.filter((seat) => seat.position !== "Alternate");
  for (const seat of requiredSeats) {
    if (!seat.name.trim()) {
      errors.push(`${seat.position} is required.`);
    }
  }
  if (!game.date) errors.push("Game date is required.");
  if (!game.home.trim()) errors.push("Home team is required.");
  if (!game.visitor.trim()) errors.push("Visiting team is required.");
  if (Number.isNaN(game.homeScore) || Number.isNaN(game.visitorScore)) {
    errors.push("Both scores are required.");
  }

  const filled = game.videos.filter(isVideoComplete);
  if (filled.length !== 4) {
    errors.push("Exactly four videos are required, each with a file, description, and play type.");
  }

  if (needsFourMinuteReport(game)) {
    const complete = game.fourMinuteLines.filter(isFourMinuteLineComplete);
    if (complete.length === 0) {
      errors.push("A close game or overtime requires at least one complete 4-Minute Report line.");
    }
  }

  return errors;
}

export function gameTitle(game: Pick<Game, "visitor" | "home">): string {
  return `${game.visitor} at ${game.home}`;
}
