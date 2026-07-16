import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "constituency" or "impact" (defaults to constituency)

    // Calculate dynamic counts from projects table
    const projResult = await query("SELECT status, category, community, budget FROM projects");
    const rows = projResult.rows;

    const total = rows.length;
    const completed = rows.filter((r) => r.status === "Completed").length;
    const ongoing = rows.filter((r) => r.status === "Ongoing").length;
    const planned = rows.filter((r) => r.status === "Planned").length;

    const schools = rows.filter((r) => r.category === "Education").length;
    const roads = rows.filter((r) => r.category === "Roads").length;
    const health = rows.filter((r) => r.category === "Health").length;
    const water = rows.filter((r) => r.category === "Water & Sanitation").length;
    const youth = rows.filter((r) => r.category === "Youth Empowerment" || r.category === "Youth").length;

    const communitiesCount = new Set(rows.map((r) => r.community)).size;

    if (type === "impact") {
      const result = await query("SELECT * FROM impact_stats ORDER BY id ASC");
      const impactStats = result.rows.map((row) => {
        let val = row.value;
        if (row.label === "Schools Built") val = String(schools);
        else if (row.label === "Boreholes") val = String(water);
        else if (row.label === "Health Centers") val = String(health);
        else if (row.label === "Roads") val = String(roads);

        return {
          label: row.label,
          value: val,
        };
      });
      return NextResponse.json(impactStats);
    } else {
      const result = await query("SELECT * FROM constituency_stats ORDER BY id ASC");
      const constituencyStats = result.rows.map((row) => {
        let val = row.value;
        let note = row.note;

        if (row.label === "Total Projects") {
          val = String(total);
          note = `Across ${communitiesCount} communities`;
        } else if (row.label === "Completed Projects") {
          val = String(completed);
        } else if (row.label === "Ongoing Projects") {
          val = String(ongoing);
        } else if (row.label === "Planned Projects") {
          val = String(planned);
        } else if (row.label === "Schools Built") {
          val = String(schools);
        } else if (row.label === "Roads Constructed") {
          val = String(roads);
        } else if (row.label === "Health Facilities") {
          val = String(health);
        } else if (row.label === "Water Projects") {
          val = String(water);
        } else if (row.label === "Youth Programs") {
          val = String(youth);
        }

        return {
          label: row.label,
          value: val,
          note: note,
        };
      });
      return NextResponse.json(constituencyStats);
    }
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { type, items } = await req.json();

    if (!type || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (type === "constituency") {
      // Upsert constituency stats
      for (const item of items) {
        await query(
          `INSERT INTO constituency_stats (label, value, note) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (label) DO UPDATE SET value = EXCLUDED.value, note = EXCLUDED.note`,
          [item.label, item.value, item.note]
        );
      }
    } else if (type === "impact") {
      // Upsert impact stats
      for (const item of items) {
        await query(
          `INSERT INTO impact_stats (label, value) 
           VALUES ($1, $2) 
           ON CONFLICT (label) DO UPDATE SET value = EXCLUDED.value`,
          [item.label, item.value]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/stats error:", error);
    return NextResponse.json({ error: "Failed to save stats" }, { status: 500 });
  }
}
