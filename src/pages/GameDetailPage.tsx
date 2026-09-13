import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CrewFields } from "../components/CrewFields";
import { FourMinuteEditor } from "../components/FourMinuteEditor";
import { StatusBadge } from "../components/StatusBadge";
import { Switch } from "../components/Switch";
import { VideoSlots } from "../components/VideoSlots";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import {
  canEditAdminNotes,
  canEditGameFields,
  canPostSupervisorComments,
  canSubmitGame,
  gameTitle,
  needsFourMinuteReport,
  validateSubmit,
} from "../lib/rules";
import type { Game, SupervisorComment } from "../types";

export function GameDetailPage() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const { getGame, officials, updateGame, submitGame, setAdminNotes, addComment, lookupUser } = useAppData();
  const stored = gameId ? getGame(gameId) : undefined;
  const [draft, setDraft] = useState<Game | undefined>(stored);
  const [notes, setNotes] = useState(stored?.adminNotes ?? "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setDraft(stored);
    setNotes(stored?.adminNotes ?? "");
  }, [stored]);

  if (!user) return null;
  if (!stored || !draft) {
    return (
      <div className="panel">
        This game is not available for your account. Officials only see crews they worked.
      </div>
    );
  }

  const locked = !canEditGameFields(user, stored);
  const fourMin = needsFourMinuteReport(draft);

  function saveFields() {
    if (!draft) return;
    setError("");
    try {
      updateGame(draft.id, {
        date: draft.date,
        home: draft.home,
        visitor: draft.visitor,
        homeScore: draft.homeScore,
        visitorScore: draft.visitorScore,
        overtime: draft.overtime,
        crew: draft.crew,
        videos: draft.videos,
        fourMinuteLines: draft.fourMinuteLines,
      });
      setNotice("Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  function onSubmit() {
    if (!draft) return;
    setError("");
    const errors = validateSubmit(draft);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }
    try {
      saveFields();
      submitGame(draft.id);
      setNotice("Report submitted. The crew is now locked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
    }
  }

  function onNotes(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    try {
      setAdminNotes(draft.id, notes);
      setNotice("Admin notes updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save notes.");
    }
  }

  return (
    <section className="grid">
      <div className="page-head">
        <div>
          <p className="kicker">
            <Link to="/">Games</Link>
          </p>
          <h1>{gameTitle(draft)}</h1>
          <p className="lede">
            {draft.date} · {draft.visitorScore}–{draft.homeScore}
            {draft.overtime ? " · OT" : ""}
          </p>
        </div>
        <StatusBadge status={stored.status} />
      </div>

      {stored.status === "submitted" ? (
        <div className="lock-note">
          Submitted. The crew assignment is locked.
          {user.role === "supervisor"
            ? " You may still add comments and admin notes."
            : user.role === "admin"
              ? " Admins can view this packet but cannot post supervisor comments."
              : " Only a supervisor can edit after submit."}
        </div>
      ) : null}

      <div className="panel grid">
        <h2>Game</h2>
        <div className="form-grid">
          <div className="field field-date">
            <label>Date</label>
            <input
              type="date"
              disabled={locked}
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </div>
          <div className="field">
            <Switch
              label="Overtime"
              hint={draft.overtime ? "4-minute report required" : "Regulation"}
              checked={draft.overtime}
              disabled={locked}
              onChange={(overtime) => setDraft({ ...draft, overtime })}
            />
          </div>
          <div className="field">
            <label>Visitor</label>
            <input
              disabled={locked}
              value={draft.visitor}
              onChange={(event) => setDraft({ ...draft, visitor: event.target.value })}
            />
          </div>
          <div className="field">
            <label>Home</label>
            <input
              disabled={locked}
              value={draft.home}
              onChange={(event) => setDraft({ ...draft, home: event.target.value })}
            />
          </div>
          <div className="field">
            <label>Visitor score</label>
            <input
              type="number"
              disabled={locked}
              value={draft.visitorScore}
              onChange={(event) => setDraft({ ...draft, visitorScore: Number(event.target.value) })}
            />
          </div>
          <div className="field">
            <label>Home score</label>
            <input
              type="number"
              disabled={locked}
              value={draft.homeScore}
              onChange={(event) => setDraft({ ...draft, homeScore: Number(event.target.value) })}
            />
          </div>
        </div>
        <h3>Crew</h3>
        <CrewFields
          crew={draft.crew}
          officials={officials}
          disabled={locked || stored.status === "submitted"}
          onChange={(crew) => setDraft({ ...draft, crew })}
        />
      </div>

      <div className="grid">
        <h2>Videos</h2>
        <VideoSlots
          videos={draft.videos}
          disabled={locked}
          onChange={(videos) => setDraft({ ...draft, videos })}
        />
      </div>

      <div className="panel grid">
        <h2>4-Minute Report</h2>
        {fourMin ? (
          <p className="lock-note">Required because this game is overtime or the margin is 6 or fewer.</p>
        ) : (
          <p className="meta">Optional on this scoreline.</p>
        )}
        <FourMinuteEditor
          key={draft.id}
          lines={draft.fourMinuteLines}
          crew={draft.crew}
          videos={draft.videos}
          disabled={locked}
          onChange={(fourMinuteLines) => setDraft({ ...draft, fourMinuteLines })}
        />
      </div>

      {error ? <div className="error">{error}</div> : null}
      {notice ? <div className="notice">{notice}</div> : null}

      <div className="row">
        {locked ? null : (
          <button className="ghost" type="button" onClick={saveFields}>
            Save draft
          </button>
        )}
        {canSubmitGame(user, stored) ? (
          <button className="primary" type="button" onClick={onSubmit}>
            Submit report
          </button>
        ) : null}
      </div>

      <SupervisorReview
        game={stored}
        canComment={canPostSupervisorComments(user)}
        lookupUser={lookupUser}
        onComment={(target, body) => addComment(stored.id, target, body)}
      />

      <form className="panel grid" onSubmit={onNotes}>
        <h2>Game admin notes</h2>
        <textarea
          disabled={!canEditAdminNotes(user)}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={canEditAdminNotes(user) ? "Supervisor notes for this crew…" : "No notes yet."}
        />
        {canEditAdminNotes(user) ? (
          <button className="primary" type="submit">
            Save notes
          </button>
        ) : null}
      </form>
    </section>
  );
}

function SupervisorReview({
  game,
  canComment,
  lookupUser,
  onComment,
}: {
  game: Game;
  canComment: boolean;
  lookupUser: (id: string) => { name: string } | undefined;
  onComment: (target: SupervisorComment["target"], body: string) => void;
}) {
  return (
    <div className="panel grid">
      <h2>Supervisor comments</h2>
      {!canComment ? (
        <p className="meta">
          {game.comments.length === 0
            ? "No supervisor comments yet."
            : "Comments are visible; only supervisors may add them."}
        </p>
      ) : (
        <p className="meta">Comment on a video or a 4-minute line. Admins cannot post here.</p>
      )}
      {game.videos
        .filter((video) => video.fileName)
        .map((video) => (
          <CommentThread
            key={video.id}
            title={`Video ${video.slot} · ${video.playType || "clip"}`}
            comments={game.comments.filter((comment) => comment.target.type === "video" && comment.target.id === video.id)}
            canComment={canComment}
            lookupUser={lookupUser}
            onSubmit={(body) => onComment({ type: "video", id: video.id }, body)}
          />
        ))}
      {game.fourMinuteLines.map((line, index) => (
        <CommentThread
          key={line.id}
          title={`4-min line ${index + 1} · ${line.playType || "open"}`}
          comments={game.comments.filter((comment) => comment.target.type === "fourMinLine" && comment.target.id === line.id)}
          canComment={canComment}
          lookupUser={lookupUser}
          onSubmit={(body) => onComment({ type: "fourMinLine", id: line.id }, body)}
        />
      ))}
    </div>
  );
}

function CommentThread({
  title,
  comments,
  canComment,
  lookupUser,
  onSubmit,
}: {
  title: string;
  comments: SupervisorComment[];
  canComment: boolean;
  lookupUser: (id: string) => { name: string } | undefined;
  onSubmit: (body: string) => void;
}) {
  const [body, setBody] = useState("");
  return (
    <div className="grid">
      <strong>{title}</strong>
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <div className="meta">
            {lookupUser(comment.authorId)?.name ?? "Supervisor"} · {new Date(comment.createdAt).toLocaleString()}
          </div>
          {comment.body}
        </div>
      ))}
      {canComment ? (
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            if (!body.trim()) return;
            onSubmit(body);
            setBody("");
          }}
        >
          <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a comment" />
          <button className="ghost" type="submit">
            Post
          </button>
        </form>
      ) : null}
    </div>
  );
}
