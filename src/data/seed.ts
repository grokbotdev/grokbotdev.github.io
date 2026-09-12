import type { Game, Playlist, User } from "../types";

export const DEMO_PASSWORD = "DemoPass123!";

export const DEMO_USERS: User[] = [
  {
    id: "official-alex",
    name: "Alex Rivera",
    email: "alex.rivera@demo.ae-officials.local",
    role: "official",
    password: DEMO_PASSWORD,
  },
  {
    id: "official-jordan",
    name: "Jordan Lee",
    email: "jordan.lee@demo.ae-officials.local",
    role: "official",
    password: DEMO_PASSWORD,
  },
  {
    id: "official-sam",
    name: "Sam Patel",
    email: "sam.patel@demo.ae-officials.local",
    role: "official",
    password: DEMO_PASSWORD,
  },
  {
    id: "official-casey",
    name: "Casey Morgan",
    email: "casey.morgan@demo.ae-officials.local",
    role: "official",
    password: DEMO_PASSWORD,
  },
  {
    id: "supervisor-taylor",
    name: "Taylor Brooks",
    email: "taylor.brooks@demo.ae-officials.local",
    role: "supervisor",
    password: DEMO_PASSWORD,
  },
  {
    id: "admin-riley",
    name: "Riley Quinn",
    email: "riley.quinn@demo.ae-officials.local",
    role: "admin",
    password: DEMO_PASSWORD,
  },
];

export const OFFICIALS = DEMO_USERS.filter((user) => user.role === "official");

function video(
  id: string,
  slot: 1 | 2 | 3 | 4,
  playType: string,
  description: string,
): Game["videos"][number] {
  return {
    id,
    slot,
    description,
    playType,
    fileName: `${id}.mp4`,
    fileSize: 8_400_000 + slot * 120_000,
    mimeType: "video/mp4",
    processingStatus: "ready",
    storagePath: `games/seed/${id}/source.mp4`,
    remoteUrl: "",
  };
}

export const SEED_GAMES: Game[] = [
  {
    id: "game-northridge-oakmont",
    status: "submitted",
    date: "2026-02-08",
    home: "Northridge",
    visitor: "Oakmont",
    homeScore: 68,
    visitorScore: 64,
    overtime: false,
    crew: [
      { position: "R", userId: "official-alex", name: "Alex Rivera" },
      { position: "U1", userId: "official-jordan", name: "Jordan Lee" },
      { position: "U2", userId: "official-sam", name: "Sam Patel" },
      { position: "Alternate", userId: null, name: "Morgan Hale" },
    ],
    createdBy: "official-alex",
    createdAt: "2026-02-08T22:15:00.000Z",
    updatedAt: "2026-02-09T01:40:00.000Z",
    submittedAt: "2026-02-09T01:40:00.000Z",
    videos: [
      video("vid-bc", 1, "Block/Charge", "Last-four block/charge at the restricted area."),
      video("vid-travel", 2, "Travel", "Post gather in the paint, U1 primary."),
      video("vid-oob", 3, "Out of bounds", "Sideline save, trail coverage."),
      video("vid-gt", 4, "Goaltending/BI", "Shot-clock possession at the rim."),
    ],
    fourMinuteLines: [
      {
        id: "fm-1",
        half: "2nd",
        gameClock: "3:18",
        positions: ["Lead"],
        officialIds: ["official-alex"],
        decision: "CC",
        playType: "Block/Charge",
        explanation: "Lead had legal guarding position before the gather.",
        videoId: "vid-bc",
      },
      {
        id: "fm-2",
        half: "2nd",
        gameClock: "0:47.4",
        positions: ["Trail", "Center"],
        officialIds: ["official-jordan"],
        decision: "NCI",
        playType: "Foul",
        explanation: "Contact on the shooter needed a whistle; trail was ball-watching.",
        videoId: "vid-travel",
      },
    ],
    adminNotes: "Close game. Review lead’s restricted-area mechanic in film.",
    comments: [
      {
        id: "c-1",
        authorId: "supervisor-taylor",
        body: "Good wide-angle from lead. Stay with the defender’s feet a beat longer.",
        createdAt: "2026-02-09T15:10:00.000Z",
        target: { type: "video", id: "vid-bc" },
      },
      {
        id: "c-2",
        authorId: "supervisor-taylor",
        body: "Agree with NCI. Trail needs to referee the defense on the catch.",
        createdAt: "2026-02-09T15:14:00.000Z",
        target: { type: "fourMinLine", id: "fm-2" },
      },
    ],
  },
  {
    id: "game-draft-westhill",
    status: "draft",
    date: "2026-02-11",
    home: "Westhill",
    visitor: "Cedar Ridge",
    homeScore: 71,
    visitorScore: 54,
    overtime: false,
    crew: [
      { position: "R", userId: "official-casey", name: "Casey Morgan" },
      { position: "U1", userId: "official-alex", name: "Alex Rivera" },
      { position: "U2", userId: "official-jordan", name: "Jordan Lee" },
      { position: "Alternate", userId: null, name: "" },
    ],
    createdBy: "official-casey",
    createdAt: "2026-02-11T23:02:00.000Z",
    updatedAt: "2026-02-11T23:20:00.000Z",
    videos: [
      video("vid-draft-1", 1, "Foul (personal)", "Help-side block in transition."),
      {
        id: "vid-draft-2",
        slot: 2,
        description: "",
        playType: "",
        fileName: "",
        fileSize: 0,
        mimeType: "",
        processingStatus: "empty",
      },
      {
        id: "vid-draft-3",
        slot: 3,
        description: "",
        playType: "",
        fileName: "",
        fileSize: 0,
        mimeType: "",
        processingStatus: "empty",
      },
      {
        id: "vid-draft-4",
        slot: 4,
        description: "",
        playType: "",
        fileName: "",
        fileSize: 0,
        mimeType: "",
        processingStatus: "empty",
      },
    ],
    fourMinuteLines: [],
    adminNotes: "",
    comments: [],
  },
];

export const SEED_PLAYLISTS: Playlist[] = [
  {
    id: "playlist-block-charge",
    name: "Restricted-area block/charge",
    description: "Teaching clips for lead mechanics in the last four minutes.",
    videoRefs: [{ gameId: "game-northridge-oakmont", videoId: "vid-bc" }],
    createdAt: "2026-02-10T12:00:00.000Z",
  },
];
