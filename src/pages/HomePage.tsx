import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { gameTitle, needsFourMinuteReport } from "../lib/rules";

export function HomePage() {
  const { user } = useAuth();
  const { games } = useAppData();
  if (!user) return null;

  const heading =
    user.role === "official" ? "My games" : user.role === "supervisor" ? "All games" : "Games";

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="kicker">{user.name}</p>
          <h1>{heading}</h1>
          <p className="lede">
            {user.role === "official"
              ? "Draft and submit reports for crews you worked. Submitted games lock the crew."
              : user.role === "supervisor"
                ? "Review every submitted packet, comment on video and 4-minute lines, and keep admin notes."
                : "View all games and manage the association video library. Admins do not post supervisor comments."}
          </p>
        </div>
        {user.role === "official" ? (
          <Link className="primary" to="/games/new">
            New game
          </Link>
        ) : null}
      </div>
      {games.length === 0 ? (
        <div className="panel">No games are visible for this account yet.</div>
      ) : (
        <div className="grid game-grid">
          {games.map((game) => (
            <Link key={game.id} className="card game-card" to={`/games/${game.id}`}>
              <div className="game-card-top">
                <div className="row">
                  <StatusBadge status={game.status} />
                  {game.overtime ? <span className="badge badge-ot">OT</span> : null}
                  {needsFourMinuteReport(game) ? <span className="badge badge-req">4-min</span> : null}
                </div>
                <div className="scoreline">{gameTitle(game)}</div>
              </div>
              <div className="game-card-body">
                <div className="meta">
                  {game.date} · {game.visitorScore}–{game.homeScore}
                </div>
                <div className="meta">
                  {game.crew
                    .filter((seat) => seat.name)
                    .map((seat) => `${seat.position} ${seat.name}`)
                    .join(" · ")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
