import { useEffect, useRef, useState } from "react";
import { emptyFourMinuteLine, HALVES, nextFourMinuteLine } from "../lib/fourMinute";
import { isFourMinuteLineComplete } from "../lib/rules";
import {
  COURT_POSITIONS,
  DECISION_LABELS,
  FOUR_MIN_PLAY_TYPES,
  type CrewAssignment,
  type DecisionCode,
  type FourMinuteLine,
  type GameVideo,
  type Half,
} from "../types";
import { ChipSelect } from "./ChipSelect";

function officialOptions(crew: CrewAssignment[]) {
  return crew
    .filter((seat) => seat.userId && seat.name)
    .map((seat) => ({ id: seat.userId as string, label: `${seat.position} ${seat.name}` }));
}

function splitLines(lines: FourMinuteLine[], disabled: boolean | undefined, fallback: FourMinuteLine) {
  const last = lines[lines.length - 1];
  if (!disabled && last && !isFourMinuteLineComplete(last)) {
    return { committed: lines.slice(0, -1), composer: last };
  }
  return {
    committed: lines,
    composer: last ? nextFourMinuteLine(last) : fallback,
  };
}

export function newFourMinuteLine(): FourMinuteLine {
  return emptyFourMinuteLine();
}

export function FourMinuteEditor({
  lines,
  crew,
  videos,
  disabled,
  onChange,
}: {
  lines: FourMinuteLine[];
  crew: CrewAssignment[];
  videos: GameVideo[];
  disabled?: boolean;
  onChange: (lines: FourMinuteLine[]) => void;
}) {
  const fallbackRef = useRef(emptyFourMinuteLine());
  const [committed, setCommitted] = useState(() => splitLines(lines, disabled, fallbackRef.current).committed);
  const [composer, setComposer] = useState(() => splitLines(lines, disabled, fallbackRef.current).composer);
  const [error, setError] = useState("");
  const committedKey = lines.filter(isFourMinuteLineComplete).map((line) => line.id).join("|");

  useEffect(() => {
    const next = splitLines(lines, disabled, fallbackRef.current);
    setCommitted(next.committed);
    setComposer((current) => (current.id === next.composer.id ? next.composer : next.composer));
  }, [committedKey, disabled, lines]);

  const officials = officialOptions(crew);

  function emit(nextCommitted: FourMinuteLine[], nextComposer: FourMinuteLine) {
    setCommitted(nextCommitted);
    setComposer(nextComposer);
    const shouldInclude =
      nextComposer.half !== "" ||
      nextComposer.gameClock.trim() !== "" ||
      nextComposer.positions.length > 0 ||
      nextComposer.officialIds.length > 0 ||
      nextComposer.decision !== "" ||
      nextComposer.playType.trim() !== "" ||
      nextComposer.explanation.trim() !== "" ||
      Boolean(nextComposer.videoId);
    onChange(shouldInclude ? [...nextCommitted, nextComposer] : nextCommitted);
  }

  function addLine() {
    if (!isFourMinuteLineComplete(composer)) {
      setError("Finish this line (positions, officials, decision, play type, explanation) before adding another.");
      return;
    }
    setError("");
    emit([...committed, composer], nextFourMinuteLine(composer));
  }

  function removeCommitted(id: string) {
    emit(
      committed.filter((line) => line.id !== id),
      composer,
    );
  }

  function patchComposer(partial: Partial<FourMinuteLine>) {
    setError("");
    emit(committed, { ...composer, ...partial });
  }

  return (
    <div className="fm-stack">
      {committed.map((line, index) => (
        <article key={line.id} className="fm-saved">
          <div className="fm-saved-head">
            <span className="fm-index">{String(index + 1).padStart(2, "0")}</span>
            <strong>
              {line.half || "—"} · {line.gameClock || "—"}
            </strong>
            <span className="meta">
              {line.positions.join(" / ") || "—"} · {line.decision} · {line.playType}
            </span>
            {disabled ? null : (
              <button className="text-btn" type="button" onClick={() => removeCommitted(line.id)}>
                Remove
              </button>
            )}
          </div>
          <p className="fm-saved-body">{line.explanation}</p>
        </article>
      ))}

      {disabled ? (
        committed.length === 0 ? <p className="meta">No 4-minute lines on this game.</p> : null
      ) : (
        <article className="fm-composer">
          <div className="fm-composer-head">
            <span className="kicker">New line</span>
            <span className="meta">Half and clock carry to the next entry</span>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="fm-half">Half</label>
              <select
                id="fm-half"
                value={composer.half}
                onChange={(event) => patchComposer({ half: event.target.value as Half | "" })}
              >
                <option value="">Select</option>
                {HALVES.map((half) => (
                  <option key={half} value={half}>
                    {half}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fm-clock">Game clock</label>
              <input
                id="fm-clock"
                value={composer.gameClock}
                placeholder="3:18 or 0:47.4"
                onChange={(event) => patchComposer({ gameClock: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="fm-decision">Decision</label>
              <select
                id="fm-decision"
                value={composer.decision}
                onChange={(event) => patchComposer({ decision: event.target.value as DecisionCode | "" })}
              >
                <option value="">Select</option>
                {(Object.keys(DECISION_LABELS) as DecisionCode[]).map((code) => (
                  <option key={code} value={code}>
                    {code} · {DECISION_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fm-play">Play type</label>
              <select
                id="fm-play"
                value={composer.playType}
                onChange={(event) => patchComposer({ playType: event.target.value })}
              >
                <option value="">Select</option>
                {FOUR_MIN_PLAY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="field span-2">
              <label htmlFor="fm-video">Linked video</label>
              <select
                id="fm-video"
                value={composer.videoId ?? ""}
                onChange={(event) => patchComposer({ videoId: event.target.value || undefined })}
              >
                <option value="">None</option>
                {videos
                  .filter((video) => video.fileName || video.description)
                  .map((video) => (
                    <option key={video.id} value={video.id}>
                      Video {video.slot}
                      {video.playType ? ` · ${video.playType}` : ""}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <ChipSelect
            label="Positions"
            options={COURT_POSITIONS}
            values={composer.positions}
            onChange={(positions) => patchComposer({ positions })}
          />
          <ChipSelect
            label="Officials"
            options={officials.map((item) => item.id)}
            values={composer.officialIds}
            optionLabel={(id) => officials.find((item) => item.id === id)?.label ?? id}
            onChange={(officialIds) => patchComposer({ officialIds })}
          />
          <div className="field">
            <label htmlFor="fm-expl">Explanation</label>
            <textarea
              id="fm-expl"
              value={composer.explanation}
              onChange={(event) => patchComposer({ explanation: event.target.value })}
              placeholder="What happened, and why this ruling?"
            />
          </div>
          {error ? <div className="error">{error}</div> : null}
          <div className="row">
            <button className="primary" type="button" onClick={addLine}>
              Add line
            </button>
            <span className="meta">Adds this entry, then keeps half and clock for the next one.</span>
          </div>
        </article>
      )}
    </div>
  );
}
