import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { filterLibrary, uniquePlayTypes, uniqueTeams } from "../lib/library";
import { gameTitle } from "../lib/rules";
import { formatBytes, processingLabel } from "../lib/videoUpload";
import { EMPTY_LIBRARY_FILTERS, UPLOAD_PLAY_TYPES, type LibraryFilters } from "../types";

export function LibraryPage() {
  const { library, playlists, addVideoToPlaylist } = useAppData();
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_LIBRARY_FILTERS);

  const playTypes = uniquePlayTypes(library);
  const teams = uniqueTeams(library);
  const visible = useMemo(() => filterLibrary(library, filters), [filters, library]);

  function patch(partial: Partial<LibraryFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  return (
    <section className="grid">
      <div className="page-head">
        <div>
          <p className="kicker">Admin</p>
          <h1>Video library</h1>
          <p className="lede">
            Filter association clips by play type, team, or description. Officials do not have a
            global library in v1. Admins file clips into playlists and do not post supervisor comments.
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
          <table>
            <thead>
              <tr>
                <th>Clip</th>
                <th>Teams</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((clip) => (
                <tr key={`${clip.gameId}-${clip.videoId}`}>
                  <td>
                    Video {clip.slot} · {clip.playType || "—"}
                    <div className="meta">
                      {clip.description || "No description"} · {clip.fileName} · {formatBytes(clip.fileSize)}
                    </div>
                  </td>
                  <td>
                    <Link to={`/games/${clip.gameId}`}>{gameTitle(clip.game)}</Link>
                    <div className="meta">
                      {clip.visitorTeam} / {clip.homeTeam}
                    </div>
                  </td>
                  <td>{processingLabel(clip.processingStatus)}</td>
                  <td>
                    {playlists[0] ? (
                      <button
                        className="ghost"
                        type="button"
                        onClick={() =>
                          addVideoToPlaylist(playlists[0].id, { gameId: clip.gameId, videoId: clip.videoId })
                        }
                      >
                        Add to playlist
                      </button>
                    ) : (
                      <span className="meta">Create a playlist first</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
