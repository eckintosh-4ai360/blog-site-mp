import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { categories as defaultCategories } from "@/lib/portal-data";

const MAX_LENGTH = 60;

/**
 * Creates the categories table on first use and seeds it with the built-in
 * list, so no manual migration step is needed on an existing database.
 * `sort_order` keeps the seeded list in its curated order; admin-added
 * categories are appended after it.
 */
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(
    `CREATE UNIQUE INDEX IF NOT EXISTS categories_name_lower_idx ON categories (lower(name))`,
  );

  const { rows } = await query("SELECT COUNT(*)::int AS count FROM categories");
  if (rows[0]?.count === 0) {
    for (const [index, name] of defaultCategories.entries()) {
      await query(
        `INSERT INTO categories (name, sort_order) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [name, index],
      );
    }
  }
}

async function listCategories(): Promise<string[]> {
  const result = await query(
    "SELECT name FROM categories ORDER BY sort_order ASC, name ASC",
  );
  return result.rows.map((row) => row.name as string);
}

export async function GET() {
  try {
    await ensureTable();
    return NextResponse.json(await listCategories());
  } catch (error) {
    console.error("GET /api/categories error:", error);
    // Fall back to the built-in list so the admin form stays usable.
    return NextResponse.json(defaultCategories);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    if (name.length > MAX_LENGTH) {
      return NextResponse.json(
        { error: `Category name must be ${MAX_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    await ensureTable();

    // Reuse an existing category when it only differs by case or spacing.
    const existing = await query("SELECT name FROM categories WHERE lower(name) = lower($1)", [
      name,
    ]);
    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        name: existing.rows[0].name as string,
        created: false,
        categories: await listCategories(),
      });
    }

    await query(
      `INSERT INTO categories (name, sort_order)
       VALUES ($1, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories))
       ON CONFLICT DO NOTHING`,
      [name],
    );

    return NextResponse.json({
      success: true,
      name,
      created: true,
      categories: await listCategories(),
    });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Failed to save category" }, { status: 500 });
  }
}
