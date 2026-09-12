import { useRef } from "react";
import { attachLocalVideo, enqueuePlaceholderProcessing, formatBytes, processingLabel } from "../lib/videoUpload";
import { UPLOAD_PLAY_TYPES, type GameVideo } from "../types";

export function VideoSlots({
  videos,
  disabled,
  onChange,
}: {
  videos: GameVideo[];
  disabled?: boolean;
  onChange: (videos: GameVideo[]) => void;
}) {
  const videosRef = useRef(videos);
  videosRef.current = videos;

  async function onFile(slot: GameVideo["slot"], file: File | undefined) {
    if (!file) return;
    const current = videosRef.current.find((video) => video.slot === slot)!;
    const result = attachLocalVideo(slot, file, current);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    onChange(videosRef.current.map((video) => (video.slot === slot ? result.video : video)));
    const processed = await enqueuePlaceholderProcessing(result.video);
    onChange(
      videosRef.current.map((video) =>
        video.slot === slot
          ? {
              ...video,
              ...processed,
              description: video.description,
              playType: video.playType,
              localPreviewUrl: video.localPreviewUrl || processed.localPreviewUrl,
            }
          : video,
      ),
    );
  }

  function patch(slot: GameVideo["slot"], partial: Partial<GameVideo>) {
    onChange(videos.map((video) => (video.slot === slot ? { ...video, ...partial } : video)));
  }

  return (
    <div className="grid">
      {videos.map((video) => (
        <article key={video.slot} className="card video-slot">
          <div className="row">
            <strong>Video {video.slot}</strong>
            <span className="meta">{processingLabel(video.processingStatus)}</span>
          </div>
          <label className="drop">
            <input
              type="file"
              accept="video/*"
              disabled={disabled}
              onChange={(event) => onFile(video.slot, event.target.files?.[0])}
            />
            {video.fileName ? (
              <span>
                {video.fileName}
                <br />
                <span className="meta">{formatBytes(video.fileSize)} · ≤ 100 MB</span>
              </span>
            ) : (
              <span>
                Tap to choose a clip
                <br />
                <span className="meta">Phone or desktop · video only · 100 MB max</span>
              </span>
            )}
          </label>
          {video.localPreviewUrl || video.remoteUrl ? (
            <video className="video-preview" controls src={video.localPreviewUrl || video.remoteUrl} />
          ) : null}
          <div className="field">
            <label htmlFor={`play-${video.slot}`}>Play type</label>
            <select
              id={`play-${video.slot}`}
              disabled={disabled}
              value={video.playType}
              onChange={(event) => patch(video.slot, { playType: event.target.value })}
            >
              <option value="">Select play type</option>
              {UPLOAD_PLAY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`desc-${video.slot}`}>Description</label>
            <textarea
              id={`desc-${video.slot}`}
              disabled={disabled}
              value={video.description}
              onChange={(event) => patch(video.slot, { description: event.target.value })}
              placeholder="What should the supervisor see in this clip?"
            />
          </div>
        </article>
      ))}
    </div>
  );
}
