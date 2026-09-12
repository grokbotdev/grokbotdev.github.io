import type { FourMinuteLine, Half } from "../types";
import { createId } from "./ids";

export function emptyFourMinuteLine(carry?: Pick<FourMinuteLine, "half" | "gameClock">): FourMinuteLine {
  return {
    id: createId("fm"),
    half: carry?.half ?? "",
    gameClock: carry?.gameClock ?? "",
    positions: [],
    officialIds: [],
    decision: "",
    playType: "",
    explanation: "",
  };
}

/** After a line is added, keep half + clock; clear everything else. */
export function nextFourMinuteLine(previous: FourMinuteLine): FourMinuteLine {
  return emptyFourMinuteLine({ half: previous.half, gameClock: previous.gameClock });
}

export function composerHasContent(line: FourMinuteLine): boolean {
  return (
    line.positions.length > 0 ||
    line.officialIds.length > 0 ||
    line.decision !== "" ||
    line.playType.trim().length > 0 ||
    line.explanation.trim().length > 0 ||
    Boolean(line.videoId) ||
    (line.half !== "" && line.gameClock.trim().length > 0)
  );
}

export function isCarryOnly(line: FourMinuteLine): boolean {
  return (
    line.positions.length === 0 &&
    line.officialIds.length === 0 &&
    line.decision === "" &&
    line.playType.trim() === "" &&
    line.explanation.trim() === "" &&
    !line.videoId
  );
}

export const HALVES: Half[] = ["1st", "2nd", "OT"];
