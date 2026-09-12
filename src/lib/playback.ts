import type { GameVideo } from "../types";

/** Public sample MP4s so the demo library/player has something to play. */
export const DEMO_PLAYBACK_URLS: Record<string, string> = {
  "vid-bc": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "vid-travel": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "vid-oob": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "vid-gt": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "vid-draft-1": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
};

export function clipPlaybackSrc(
  video: Pick<GameVideo, "id" | "localPreviewUrl" | "remoteUrl">,
): string | undefined {
  return video.localPreviewUrl || video.remoteUrl || DEMO_PLAYBACK_URLS[video.id] || undefined;
}
