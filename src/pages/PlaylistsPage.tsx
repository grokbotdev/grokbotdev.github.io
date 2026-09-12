import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { gameTitle } from "../lib/rules";

export function PlaylistsPage() {
  const { playlists, library, createPlaylist } = useAppData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
        <p className="lede">Teaching lists of association clips. Stub only — no commenting from this role.</p>
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
      {playlists.map((playlist) => (
        <article key={playlist.id} className="panel grid">
          <div>
            <h2>{playlist.name}</h2>
            <p className="meta">{playlist.description || "No description"}</p>
          </div>
          {playlist.videoRefs.length === 0 ? (
            <p className="meta">Empty. Add clips from the library.</p>
          ) : (
            <ul>
              {playlist.videoRefs.map((ref) => {
                const item = library.find(({ game, video }) => game.id === ref.gameId && video.id === ref.videoId);
                if (!item) return <li key={ref.videoId}>Unavailable clip</li>;
                return (
                  <li key={ref.videoId}>
                    <Link to={`/games/${item.game.id}`}>
                      {gameTitle(item.game)} · video {item.video.slot} · {item.video.playType}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}
