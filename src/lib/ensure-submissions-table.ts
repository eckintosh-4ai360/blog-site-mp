import { query } from "@/lib/db";
import { CITIZEN_SUBMISSIONS_TABLE_SQL } from "@/lib/submissions-schema";

let ready: Promise<void> | null = null;

export function ensureSubmissionsTable(): Promise<void> {
  if (!ready) {
    ready = query(CITIZEN_SUBMISSIONS_TABLE_SQL)
      .then(() => undefined)
      .catch((error) => {
        ready = null;
        throw error;
      });
  }
  return ready;
}
