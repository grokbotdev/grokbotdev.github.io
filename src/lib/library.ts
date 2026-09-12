import type { LibraryClip, LibraryFilters } from "../types";
import { EMPTY_LIBRARY_FILTERS } from "../types";

export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export function clipSearchBlob(clip: LibraryClip): string {
  return [clip.description, clip.fileName, clip.playType, clip.homeTeam, clip.visitorTeam, `video ${clip.slot}`]
    .join(" ")
    .toLowerCase();
}

export function clipMatchesTeam(clip: LibraryClip, team: string): boolean {
  if (!team) return true;
  const needle = normalizeSearch(team);
  return normalizeSearch(clip.homeTeam) === needle || normalizeSearch(clip.visitorTeam) === needle;
}

export function filterLibrary<T extends LibraryClip>(
  clips: T[],
  filters: LibraryFilters = EMPTY_LIBRARY_FILTERS,
): T[] {
  const text = normalizeSearch(filters.text);
  return clips.filter((clip) => {
    if (filters.playType && clip.playType !== filters.playType) return false;
    if (!clipMatchesTeam(clip, filters.team)) return false;
    if (text && !clipSearchBlob(clip).includes(text)) return false;
    return true;
  });
}

export function uniquePlayTypes(clips: LibraryClip[]): string[] {
  return [...new Set(clips.map((clip) => clip.playType).filter(Boolean))].sort();
}

export function uniqueTeams(clips: LibraryClip[]): string[] {
  return [...new Set(clips.flatMap((clip) => [clip.homeTeam, clip.visitorTeam]).filter(Boolean))].sort();
}
