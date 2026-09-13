import { useEffect } from "react";

export type PlayableClip = {
  key: string;
  title: string;
  subtitle?: string;
  src?: string;
};

export function VideoLightbox({
  clips,
  index,
  onClose,
  onIndexChange,
}: {
  clips: PlayableClip[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const clip = clips[index];
  const hasPrev = index > 0;
  const hasNext = index < clips.length - 1;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
      if (event.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [hasNext, hasPrev, index, onClose, onIndexChange]);

  if (!clip) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={clip.title} onClick={onClose}>
      <div className="lightbox-card" onClick={(event) => event.stopPropagation()}>
        <div className="lightbox-head">
          <div>
            <h2>{clip.title}</h2>
            {clip.subtitle ? <p className="meta lightbox-sub">{clip.subtitle}</p> : null}
          </div>
          <button className="ghost lightbox-close" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {clip.src ? (
          <video className="lightbox-video" key={clip.key} controls autoPlay playsInline src={clip.src} />
        ) : (
          <div className="lightbox-empty">No playback file for this clip in the current session.</div>
        )}
        <div className="lightbox-nav">
          <button className="ghost" type="button" disabled={!hasPrev} onClick={() => onIndexChange(index - 1)}>
            Previous
          </button>
          <span className="meta">
            {index + 1} / {clips.length}
          </span>
          <button className="ghost" type="button" disabled={!hasNext} onClick={() => onIndexChange(index + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
