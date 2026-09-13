import { FormEvent, useMemo, useState } from "react";
import { VideoLightbox, type PlayableClip } from "../components/VideoLightbox";
import { useAppData } from "../context/AppDataContext";
import { clipPlaybackSrc } from "../lib/playback";
import { gameTitle } from "../lib/rules";

export function PlaylistsPage() {
  const { playlists, library, createPlaylist } = useAppData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState<{ playlistId: string; index: number } | null>(null);

  const clipsByPlaylist = useMemo(() => {
    const map = new Map<string, PlayableClip[]>();
    for (const playlist of playlists) {
      map.set(
        playlist.id,
        playlist.videoRefs.flatMap((ref) => {
          const item = library.find(({ game, video }) => game.id === ref.gameId && video.id === ref.videoId);
          if (!item) return [];
          return [
            {
              key: `${ref.gameId}-${ref.videoId}`,
              title: `Video ${item.video.slot} · ${item.video.playType || "Clip"}`,
              subtitle: `${item.video.description || "No description"} · ${gameTitle(item.game)}`,
              src: clipPlaybackSrc(item.video),
            } satisfies PlayableClip,
          ];
        }),
      );
    }
    return map;
  }, [library, playlists]);

  const activeClips = active ? (clipsByPlaylist.get(active.playlistId) ?? []) : [];

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name, description);
    setName("");
    setDescription("");
  }

  return (
    <section className="grid">
      <div>
        <p className="kicker">Admin</p>
        <h1>Playlists</h1>
        <p className="lede">
          Teaching lists of association clips. Open a playlist item to play it, then use Previous / Next in
          the player. This does not open the game report. Admins do not post supervisor comments.
        </p>
      </div>
      <form className="panel form-grid" onSubmit={onCreate}>
        <div className="field">
          <label htmlFor="playlist-name">Name</label>
          <input id="playlist-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="playlist-desc">Description</label>
          <input id="playlist-desc" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <button className="primary" type="submit">
          Create playlist
        </button>
      </form>
      {playlists.map((playlist) => {
        const clips = clipsByPlaylist.get(playlist.id) ?? [];
        return (
          <article key={playlist.id} className="panel grid">
            <div>
              <h2>{playlist.name}</h2>
              <p className="meta">{playlist.description || "No description"}</p>
            </div>
            {playlist.videoRefs.length === 0 ? (
              <p className="meta">Empty. Add clips from the library.</p>
            ) : (
              <ul className="clip-list">
                {playlist.videoRefs.map((ref, index) => {
                  const item = library.find(({ game, video }) => game.id === ref.gameId && video.id === ref.videoId);
                  if (!item) return <li key={ref.videoId}>Unavailable clip</li>;
                  return (
                    <li key={ref.videoId} className="clip-row">
                      <button
                        type="button"
                        className="clip-card"
                        onClick={() => setActive({ playlistId: playlist.id, index })}
                      >
                        <span className="clip-play" aria-hidden>
                          ▶
                        </span>
                        <span className="clip-copy">
                          <strong>
                            Video {item.video.slot} · {item.video.playType || "Clip"}
                          </strong>
                          <span className="meta">
                            {gameTitle(item.game)} · {item.video.description || "No description"}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {clips.length > 0 ? <p className="meta">{clips.length} clip{clips.length === 1 ? "" : "s"} — play in order from any item.</p> : null}
          </article>
        );
      })}

      {active && activeClips.length > 0 ? (
        <VideoLightbox
          clips={activeClips}
          index={active.index}
          onClose={() => setActive(null)}
          onIndexChange={(index) => setActive({ playlistId: active.playlistId, index })}
        />
      ) : null}
    </section>
  );
}
