import type { GameStatus } from "../types";

export function StatusBadge({ status }: { status: GameStatus }) {
  return <span className={`badge badge-${status}`}>{status === "draft" ? "Draft" : "Submitted"}</span>;
}
