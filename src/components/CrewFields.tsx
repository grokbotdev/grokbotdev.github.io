import { useState } from "react";
import type { CrewAssignment, PublicUser } from "../types";

const SEATS: CrewAssignment["position"][] = ["R", "U1", "U2", "Alternate"];

export function emptyCrew(self?: PublicUser): CrewAssignment[] {
  return SEATS.map((position) => ({
    position,
    userId: position === "R" && self ? self.id : null,
    name: position === "R" && self ? self.name : "",
  }));
}

export function CrewFields({
  crew,
  officials,
  disabled,
  onChange,
}: {
  crew: CrewAssignment[];
  officials: PublicUser[];
  disabled?: boolean;
  onChange: (crew: CrewAssignment[]) => void;
}) {
  const [manualAlternate, setManualAlternate] = useState(
    () => !crew.find((seat) => seat.position === "Alternate")?.userId && Boolean(crew.find((seat) => seat.position === "Alternate")?.name),
  );

  function update(position: CrewAssignment["position"], value: string) {
    if (position === "Alternate") setManualAlternate(value === "__manual__");
    onChange(
      crew.map((seat) => {
        if (seat.position !== position) return seat;
        if (value === "__manual__") return { ...seat, userId: null, name: seat.userId ? "" : seat.name };
        if (value === "") return { ...seat, userId: null, name: "" };
        const official = officials.find((item) => item.id === value);
        return official
          ? { ...seat, userId: official.id, name: official.name }
          : { ...seat, userId: null, name: value };
      }),
    );
  }

  function updateManualName(position: CrewAssignment["position"], name: string) {
    onChange(crew.map((seat) => (seat.position === position ? { ...seat, userId: null, name } : seat)));
  }

  return (
    <div className="form-grid">
      {SEATS.map((position) => {
        const seat = crew.find((item) => item.position === position) ?? {
          position,
          userId: null,
          name: "",
        };
        const isManual = !seat.userId && Boolean(seat.name);
        return (
          <div className="field" key={position}>
            <label htmlFor={`crew-${position}`}>
              {position}
              {position === "Alternate" ? " (optional)" : ""}
            </label>
            <select
              id={`crew-${position}`}
              disabled={disabled}
              value={seat.userId ?? (manualAlternate || isManual ? "__manual__" : "")}
              onChange={(event) => update(position, event.target.value)}
            >
              <option value="">{position === "Alternate" ? "None" : "Select official"}</option>
              {officials.map((official) => (
                <option key={official.id} value={official.id}>
                  {official.name}
                </option>
              ))}
              {position === "Alternate" ? <option value="__manual__">Name not in list…</option> : null}
            </select>
            {position === "Alternate" && (manualAlternate || isManual) ? (
              <input
                placeholder="Alternate name"
                disabled={disabled}
                value={seat.name}
                onChange={(event) => updateManualName(position, event.target.value)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
