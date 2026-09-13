import { useMemo, useState } from "react";
import { VideoLightbox, type PlayableClip } from "../components/VideoLightbox";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { filterLibrary, uniquePlayTypes, uniqueTeams } from "../lib/library";
import { clipPlaybackSrc } from "../lib/playback";
import { canManagePlaylists, gameTitle } from "../lib/rules";
import { formatBytes, processingLabel } from "../lib/videoUpload";
import { EMPTY_LIBRARY_FILTERS, UPLOAD_PLAY_TYPES, type LibraryFilters } from "../types";

export function LibraryPage() {
  const { user } = useAuth();
  const { library, playlists, addVideoToPlaylist } = useAppData();
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_LIBRARY_FILTERS);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const playTypes = uniquePlayTypes(library);
  const teams = uniqueTeams(library);
  const visible = useMemo(() => filterLibrary(library, filters), [filters, library]);
  const managePlaylists = user ? canManagePlaylists(user) : false;
  const clips: PlayableClip[] = visible.map((clip) => ({
    key: `${clip.gameId}-${clip.videoId}`,
    title: `Video ${clip.slot} · ${clip.playType || "Clip"}`,
    subtitle: `${clip.description || "No description"} · ${gameTitle(clip.game)} · ${clip.visitorTeam} / ${clip.homeTeam}`,
    src: clipPlaybackSrc(clip.video),
  }));

  function patch(partial: Partial<LibraryFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  return (
    <section className="grid">
      <div className="page-head">
        <div>
          <p className="kicker">{user?.role === "supervisor" ? "Supervisor" : "Admin"}</p>
          <h1>Video library</h1>
          <p className="lede">
            {managePlaylists
              ? "Filter association clips by play type, team, or description. Open a clip to play it here — it does not open the game report. File clips into playlists from this page. Admins do not post supervisor comments."
              : "Filter association clips by play type, team, or description. Open a clip to play it here — it does not open the game report. Comments stay on the game packet. Playlists are admin-only."}
          </p>
        </div>
        <div>
          <div className="filter-count">{visible.length}</div>
          <div className="meta">of {library.length} clips</div>
        </div>
      </div>

      <div className="panel">
        <div className="filter-bar">
          <div className="field">
            <label htmlFor="lib-search">Search descriptions</label>
            <input
              id="lib-search"
              value={filters.text}
              placeholder="Restricted area, sideline, file name…"
              onChange={(event) => patch({ text: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="lib-play">Play type</label>
            <select
              id="lib-play"
              value={filters.playType}
              onChange={(event) => patch({ playType: event.target.value })}
            >
              <option value="">All play types</option>
              {(playTypes.length ? playTypes : UPLOAD_PLAY_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lib-team">Team</label>
            <select id="lib-team" value={filters.team} onChange={(event) => patch({ team: event.target.value })}>
              <option value="">Home or visitor</option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
          <button className="ghost" type="button" onClick={() => setFilters(EMPTY_LIBRARY_FILTERS)}>
            Clear
          </button>
        </div>
      </div>

      <div className="panel">
        {visible.length === 0 ? (
          <p className="meta">No clips match these filters.</p>
        ) : (
          <ul className="clip-list">
            {visible.map((clip, index) => (
              <li key={`${clip.gameId}-${clip.videoId}`} className="clip-row">
                <button type="button" className="clip-card" onClick={() => setActiveIndex(index)}>
                  <span className="clip-play" aria-hidden>
                    ▶
                  </span>
                  <span className="clip-copy">
                    <strong>
                      Video {clip.slot} · {clip.playType || "—"}
                    </strong>
                    <span className="meta">
                      {clip.description || "No description"} · {clip.fileName} · {formatBytes(clip.fileSize)}
                    </span>
                    <span className="meta">
                      {gameTitle(clip.game)} · {clip.visitorTeam} / {clip.homeTeam} · {processingLabel(clip.processingStatus)}
                    </span>
                  </span>
                </button>
                {managePlaylists ? (
                  playlists[0] ? (
                    <button
                      className="ghost clip-action"
                      type="button"
                      onClick={() =>
                        addVideoToPlaylist(playlists[0].id, { gameId: clip.gameId, videoId: clip.videoId })
                      }
                    >
                      Add to playlist
                    </button>
                  ) : (
                    <span className="meta">Create a playlist first</span>
                  )
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeIndex !== null ? (
        <VideoLightbox
          clips={clips}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      ) : null}
    </section>
  );
}
