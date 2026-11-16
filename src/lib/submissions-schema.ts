export const CITIZEN_SUBMISSIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS citizen_submissions (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('complaint', 'request', 'suggestion')),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    community TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
