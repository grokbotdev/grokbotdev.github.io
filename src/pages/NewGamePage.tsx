import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CrewFields, emptyCrew } from "../components/CrewFields";
import { FourMinuteEditor } from "../components/FourMinuteEditor";
import { Switch } from "../components/Switch";
import { VideoSlots } from "../components/VideoSlots";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { emptyVideos } from "../lib/demoStore";
import { needsFourMinuteReport, validateSubmit } from "../lib/rules";
import type { CrewAssignment, FourMinuteLine, GameVideo } from "../types";

type Step = 1 | 2 | 3;

export function NewGamePage() {
  const { user } = useAuth();
  const { officials, createGame, updateGame, submitGame } = useAppData();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [home, setHome] = useState("");
  const [visitor, setVisitor] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [visitorScore, setVisitorScore] = useState(0);
  const [overtime, setOvertime] = useState(false);
  const [crew, setCrew] = useState<CrewAssignment[]>(() => emptyCrew(user ?? undefined));
  const [videos, setVideos] = useState<GameVideo[]>(() => emptyVideos());
  const [lines, setLines] = useState<FourMinuteLine[]>([]);

  const fourMin = needsFourMinuteReport({ overtime, homeScore, visitorScore });
  const previewGame = useMemo(
    () => ({
      id: "preview",
      status: "draft" as const,
      date,
      home,
      visitor,
      homeScore,
      visitorScore,
      overtime,
      crew,
      createdBy: user?.id ?? "",
      createdAt: "",
      updatedAt: "",
      videos,
      fourMinuteLines: lines,
      adminNotes: "",
      comments: [],
    }),
    [crew, date, home, homeScore, lines, overtime, user?.id, videos, visitor, visitorScore],
  );

  if (!user || user.role !== "official") {
    return <div className="panel">Only officials create game reports.</div>;
  }

  const official = user;

  function persistDraft() {
    const created = createGame({
      date,
      home,
      visitor,
      homeScore,
      visitorScore,
      overtime,
      crew,
      createdBy: official.id,
      videos,
      fourMinuteLines: lines,
    });
    return created;
  }

  function onSaveDraft() {
    setError("");
    try {
      const created = persistDraft();
      navigate(`/games/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft.");
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step !== 3) return;
    setError("");
    const errors = validateSubmit(previewGame);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }
    try {
      const created = persistDraft();
      updateGame(created.id, { videos, fourMinuteLines: lines, crew, date, home, visitor, homeScore, visitorScore, overtime });
      submitGame(created.id);
      navigate(`/games/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="kicker">New report</p>
          <h1>Create game</h1>
          <p className="lede">Pick the crew, attach four clips, and complete a 4-minute report when the game is close or goes to overtime.</p>
        </div>
      </div>
      <div className="steps">
        <span className={`step ${step === 1 ? "current" : ""}`}>1 · Game & crew</span>
        <span className={`step ${step === 2 ? "current" : ""}`}>2 · Videos</span>
        <span className={`step ${step === 3 ? "current" : ""}`}>3 · Review</span>
      </div>
      <form className="grid" onSubmit={onSubmit}>
        {step === 1 ? (
          <div className="panel grid">
            <div className="form-grid">
              <div className="field field-date">
                <label htmlFor="date">Date</label>
                <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </div>
              <div className="field">
                <Switch
                  label="Overtime"
                  hint={overtime ? "4-minute report required" : "Regulation"}
                  checked={overtime}
                  onChange={setOvertime}
                />
              </div>
              <div className="field">
                <label htmlFor="visitor">Visitor</label>
                <input id="visitor" value={visitor} onChange={(event) => setVisitor(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="home">Home</label>
                <input id="home" value={home} onChange={(event) => setHome(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="visitorScore">Visitor score</label>
                <input
                  id="visitorScore"
                  type="number"
                  min={0}
                  value={visitorScore}
                  onChange={(event) => setVisitorScore(Number(event.target.value))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="homeScore">Home score</label>
                <input
                  id="homeScore"
                  type="number"
                  min={0}
                  value={homeScore}
                  onChange={(event) => setHomeScore(Number(event.target.value))}
                  required
                />
              </div>
            </div>
            <h2>Collaborating officials</h2>
            <CrewFields crew={crew} officials={officials} onChange={setCrew} />
            {fourMin ? (
              <p className="lock-note">This game will require 4-Minute Report lines (OT or margin of 6 or fewer).</p>
            ) : (
              <p className="notice">Margin is greater than 6 and regulation — 4-minute lines are optional.</p>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid">
            <VideoSlots videos={videos} onChange={setVideos} />
            {fourMin ? (
              <div className="panel grid">
                <h2>4-Minute Report</h2>
                <FourMinuteEditor
                  lines={lines}
                  crew={crew}
                  videos={videos}
                  onChange={setLines}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="panel grid">
            <h2>Review</h2>
            <p>
              {visitor} at {home} · {date} · {visitorScore}–{homeScore}
              {overtime ? " OT" : ""}
            </p>
            <p className="meta">
              {crew
                .filter((seat) => seat.name)
                .map((seat) => `${seat.position} ${seat.name}`)
                .join(" · ")}
            </p>
            <p className="meta">{videos.filter((video) => video.fileName).length} of 4 videos attached</p>
            {fourMin ? <p className="meta">{lines.length} 4-minute line(s) added</p> : null}
          </div>
        ) : null}

        {error ? <div className="error">{error}</div> : null}

        <div className="row">
          {step > 1 ? (
            <button className="ghost" type="button" onClick={() => setStep((step - 1) as Step)}>
              Back
            </button>
          ) : null}
          {step < 3 ? (
            <button className="primary" type="button" onClick={() => setStep((step + 1) as Step)}>
              Continue
            </button>
          ) : (
            <button className="primary" type="submit">
              Submit report
            </button>
          )}
          <button className="ghost" type="button" onClick={onSaveDraft}>
            Save draft
          </button>
        </div>
      </form>
    </section>
  );
}
