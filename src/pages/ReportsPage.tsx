import { Link } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { gameTitle, needsFourMinuteReport, scoreMargin } from "../lib/rules";

export function ReportsPage() {
  const { games } = useAppData();
  const submitted = games.filter((game) => game.status === "submitted");
  const closeOrOt = submitted.filter(needsFourMinuteReport);

  return (
    <section className="grid">
      <div>
        <p className="kicker">Supervisor</p>
        <h1>Reports</h1>
        <p className="lede">
          Lightweight summary stub. Counts and filters only — export and formal evaluations come later.
        </p>
      </div>
      <div className="form-grid">
        <div className="panel">
          <div className="kicker">Submitted packets</div>
          <div className="scoreline">{submitted.length}</div>
        </div>
        <div className="panel">
          <div className="kicker">Close / OT with 4-minute</div>
          <div className="scoreline">{closeOrOt.length}</div>
        </div>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Game</th>
              <th>Margin</th>
              <th>4-min lines</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {submitted.map((game) => (
              <tr key={game.id}>
                <td>
                  <Link to={`/games/${game.id}`}>{gameTitle(game)}</Link>
                  <div className="meta">{game.date}</div>
                </td>
                <td>
                  {scoreMargin(game)}
                  {game.overtime ? " · OT" : ""}
                </td>
                <td>{game.fourMinuteLines.length}</td>
                <td>{game.comments.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
