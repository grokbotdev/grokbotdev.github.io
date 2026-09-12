import { MAX_VIDEO_BYTES, type GameVideo, type VideoProcessingStatus } from "../types";
import { createId } from "./ids";

export type AttachResult =
  | { ok: true; video: GameVideo }
  | { ok: false; error: string };

export function attachLocalVideo(slot: 1 | 2 | 3 | 4, file: File, current: GameVideo): AttachResult {
  if (!file.type.startsWith("video/")) {
    return { ok: false, error: "Choose a video file." };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: "Each video must be 100 MB or smaller." };
  }

  if (current.localPreviewUrl) {
    URL.revokeObjectURL(current.localPreviewUrl);
  }

  return {
    ok: true,
    video: {
      ...current,
      id: current.id || createId("vid"),
      slot,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      localPreviewUrl: URL.createObjectURL(file),
      processingStatus: "attached",
      storagePath: undefined,
      remoteUrl: undefined,
    },
  };
}

/** Demo stand-in for Storage upload + Coconut enqueue. */
export async function enqueuePlaceholderProcessing(video: GameVideo): Promise<GameVideo> {
  const queued: GameVideo = {
    ...video,
    processingStatus: "queued",
    storagePath: `games/demo/${video.id}/source.mp4`,
  };
  await wait(400);
  const processing: GameVideo = { ...queued, processingStatus: "processing" };
  await wait(700);
  return {
    ...processing,
    processingStatus: "ready",
    remoteUrl: video.localPreviewUrl,
  };
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function processingLabel(status: VideoProcessingStatus): string {
  switch (status) {
    case "empty":
      return "No file";
    case "attached":
      return "Attached (demo, this session)";
    case "queued":
      return "Queued for transcode";
    case "processing":
      return "Processing (Coconut placeholder)";
    case "ready":
      return "Ready";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
