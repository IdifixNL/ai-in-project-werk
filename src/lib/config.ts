/**
 * The one place to rename the kit for your own project.
 * Change these two values and restart; tickets keep their numbers.
 */
export const PROJECT_NAME = process.env.PROJECT_NAME ?? "Talent Programme 2026";
export const TICKET_PREFIX = process.env.TICKET_PREFIX ?? "DEMO";

/** SQLite file. Relative paths resolve from the repo root. */
export const DATABASE_URL = process.env.DATABASE_URL ?? "file:data/cockpit.db";
