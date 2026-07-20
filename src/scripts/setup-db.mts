import fs from "fs";
import path from "path";
import { Client } from "@neondatabase/serverless";
import {
  projects as defaultProjects,
  news as defaultNews,
  events as defaultEvents,
  testimonials as defaultTestimonials,
  faqs as defaultFaqs,
  constituencyStats as defaultConstituencyStats,
  impactStats as defaultImpactStats,
  mediaItems as defaultMediaItems,
} from "../lib/portal-data";

// ─── Manual ENV Loader ──────────────────────────────────────────────────────
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
    console.log("Loaded environment variables from .env.local manually.");
  }
} catch (err) {
  console.warn("Could not parse .env.local:", err);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Neon PostgreSQL.");

  try {
    // 1. Create tables if they do not exist
    console.log("Creating tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        slug VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        community TEXT NOT NULL,
        budget DOUBLE PRECISION NOT NULL,
        budget_label TEXT NOT NULL,
        year TEXT NOT NULL,
        progress INTEGER NOT NULL,
        image TEXT NOT NULL,
        before_image TEXT NOT NULL,
        after_image TEXT NOT NULL,
        contractor TEXT NOT NULL,
        funding_source TEXT NOT NULL,
        start_date TEXT NOT NULL,
        expected_completion TEXT NOT NULL,
        completion_date TEXT,
        description TEXT NOT NULL,
        story TEXT NOT NULL,
        objectives JSONB NOT NULL DEFAULT '[]',
        challenges JSONB NOT NULL DEFAULT '[]',
        outcomes JSONB NOT NULL DEFAULT '[]',
        timeline JSONB NOT NULL DEFAULT '[]',
        updates JSONB NOT NULL DEFAULT '[]',
        gallery JSONB NOT NULL DEFAULT '[]',
        map JSONB NOT NULL DEFAULT '{}'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        read_time TEXT NOT NULL,
        image TEXT NOT NULL,
        excerpt TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        image TEXT NOT NULL,
        quote TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS constituency_stats (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        note TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS impact_stats (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS media_items (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL UNIQUE,
        count TEXT NOT NULL
      );
    `);

    console.log("Tables validated / created.");

    // 2. Seeding helper: check if empty, then seed
    const checkProjects = await client.query("SELECT COUNT(*) FROM projects");
    if (parseInt(checkProjects.rows[0].count, 10) === 0) {
      console.log("Seeding projects...");
      for (const p of defaultProjects) {
        await client.query(
          `INSERT INTO projects (
            slug, title, category, status, community, budget, budget_label, year, progress,
            image, before_image, after_image, contractor, funding_source, start_date,
            expected_completion, completion_date, description, story, objectives,
            challenges, outcomes, timeline, updates, gallery, map
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
          [
            p.slug,
            p.title,
            p.category,
            p.status,
            p.community,
            p.budget,
            p.budgetLabel,
            p.year,
            p.progress,
            p.image,
            p.beforeImage,
            p.afterImage,
            p.contractor,
            p.fundingSource,
            p.startDate,
            p.expectedCompletion,
            p.completionDate || null,
            p.description,
            p.story,
            JSON.stringify(p.objectives),
            JSON.stringify(p.challenges),
            JSON.stringify(p.outcomes),
            JSON.stringify(p.timeline),
            JSON.stringify(p.updates),
            JSON.stringify(p.gallery),
            JSON.stringify(p.map),
          ]
        );
      }
    }

    const checkNews = await client.query("SELECT COUNT(*) FROM news");
    if (parseInt(checkNews.rows[0].count, 10) === 0) {
      console.log("Seeding news...");
      for (const n of defaultNews) {
        await client.query(
          "INSERT INTO news (title, category, date, read_time, image, excerpt) VALUES ($1, $2, $3, $4, $5, $6)",
          [n.title, n.category, n.date, n.readTime, n.image, n.excerpt]
        );
      }
    }

    const checkEvents = await client.query("SELECT COUNT(*) FROM events");
    if (parseInt(checkEvents.rows[0].count, 10) === 0) {
      console.log("Seeding events...");
      for (const e of defaultEvents) {
        await client.query(
          "INSERT INTO events (title, date, location, type) VALUES ($1, $2, $3, $4)",
          [e.title, e.date, e.location, e.type]
        );
      }
    }

    const checkTestimonials = await client.query("SELECT COUNT(*) FROM testimonials");
    if (parseInt(checkTestimonials.rows[0].count, 10) === 0) {
      console.log("Seeding testimonials...");
      for (const t of defaultTestimonials) {
        await client.query(
          "INSERT INTO testimonials (name, role, image, quote) VALUES ($1, $2, $3, $4)",
          [t.name, t.role, t.image, t.quote]
        );
      }
    }

    const checkFaqs = await client.query("SELECT COUNT(*) FROM faqs");
    if (parseInt(checkFaqs.rows[0].count, 10) === 0) {
      console.log("Seeding FAQs...");
      for (const f of defaultFaqs) {
        await client.query(
          "INSERT INTO faqs (question, answer) VALUES ($1, $2)",
          [f.question, f.answer]
        );
      }
    }

    const checkConstituencyStats = await client.query("SELECT COUNT(*) FROM constituency_stats");
    if (parseInt(checkConstituencyStats.rows[0].count, 10) === 0) {
      console.log("Seeding constituency stats...");
      for (const s of defaultConstituencyStats) {
        await client.query(
          "INSERT INTO constituency_stats (label, value, note) VALUES ($1, $2, $3) ON CONFLICT (label) DO UPDATE SET value = EXCLUDED.value, note = EXCLUDED.note",
          [s.label, s.value, s.note]
        );
      }
    }

    const checkImpactStats = await client.query("SELECT COUNT(*) FROM impact_stats");
    if (parseInt(checkImpactStats.rows[0].count, 10) === 0) {
      console.log("Seeding impact stats...");
      for (const s of defaultImpactStats) {
        await client.query(
          "INSERT INTO impact_stats (label, value) VALUES ($1, $2) ON CONFLICT (label) DO UPDATE SET value = EXCLUDED.value",
          [s.label, s.value]
        );
      }
    }

    const checkMediaItems = await client.query("SELECT COUNT(*) FROM media_items");
    if (parseInt(checkMediaItems.rows[0].count, 10) === 0) {
      console.log("Seeding media items...");
      for (const m of defaultMediaItems) {
        await client.query(
          "INSERT INTO media_items (label, count) VALUES ($1, $2) ON CONFLICT (label) DO UPDATE SET count = EXCLUDED.count",
          [m.label, m.count]
        );
      }
    }

    console.log("Database initialized and seeded successfully.");
  } catch (error) {
    console.error("Failed to seed database:", error);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
