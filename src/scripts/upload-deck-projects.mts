/**
 * Imports the projects from "MPs projects in progressess.pptx" into Cloudinary
 * and Neon. Photos are staged per project under public/deck-projects/<slug>/ by
 * src/scripts/extract-deck.py.
 *
 * Every field below is taken from the deck itself. Facts the deck does not
 * state (budgets, contractors, funding sources, dates) are left as neutral
 * placeholders for the MP's office to complete in the admin form — nothing is
 * invented. Run with --dry-run to preview without writing anything.
 */
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { Client, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import sharp from "sharp";
import { Readable } from "stream";

neonConfig.webSocketConstructor = ws;

const DRY_RUN = process.argv.includes("--dry-run");

// --only <slug> (repeatable) restricts the run to named projects, so a fix to
// one project cannot overwrite admin edits made to the others.
const ONLY = process.argv.reduce<string[]>((acc, arg, i) => {
  if (arg === "--only" && process.argv[i + 1]) acc.push(process.argv[i + 1]);
  return acc;
}, []);

// ── Env ─────────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
    if (!match) continue;
    let value = (match[2] || "").trim();
    if (/^(".*"|'.*')$/.test(value)) value = value.slice(1, -1);
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}
loadEnv();

for (const key of [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
]) {
  if (!process.env[key]) {
    console.error(`ERROR: ${key} is not set. Add it to .env.local.`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ── Placeholders for everything the deck does not state ─────────────────────
const TBC = "To be confirmed";
const REPORTING_YEAR = "2026"; // the deck's reporting period — confirm per project

// Tarkwa-Nsuaem constituency, Western Region.
const MAP = { lat: 5.3006, lng: -1.995, x: 50, y: 50 };

// The nine seeded demo rows, replaced by the real deck content.
const PLACEHOLDER_SLUGS = [
  "cement-donation-programme",
  "community-health-outreach",
  "constituency-farming-initiative",
  "constituency-network-connectivity",
  "reshaping-inner-roads",
  "sewing-machine-donation",
  "transformer-donation-electricity",
  "water-access-project",
  "youth-road-safety-driving",
];

// Slugs superseded by a later split, removed so the old combined row does not
// linger alongside the projects that replaced it.
const RETIRED_SLUGS = ["classroom-block-and-desks"];

const NEW_CATEGORIES = [
  "Governance",
  "Creative Arts",
  "Media",
  "Economic Empowerment",
];

type Status = "Completed" | "Ongoing" | "Planned" | "On Hold" | "Archived";

interface Def {
  slug: string;
  title: string;
  category: string;
  status: Status;
  community: string;
  progress: number;
  description: string;
  story: string;
  outcomes: string[];
  /** Set when the deck presents an explicit before/after pair. */
  beforeAfter?: { before: number; after: number };
  /** Already-hosted URLs appended after the deck photos (e.g. admin uploads). */
  extraImages?: string[];
  /** 1-based index of the photo to use as the card image; defaults to the first. */
  mainIndex?: number;
}

const DEFS: Def[] = [
  {
    slug: "reshaping-inner-link-roads",
    title: "Reshaping of Inner and Link Roads",
    category: "Roads",
    status: "Ongoing",
    community: "Tarkwa Township, Tamso, Brenuakyem, Senyakrom, Cyanide",
    progress: 0,
    description:
      "Reshaping of inner and link roads within the municipalities, covering the Tamso electoral area and the Budo City to Bogoso Junction inner road, with road layout maps prepared for Brenuakyem, Senyakrom and Cyanide.",
    story:
      "Work has been carried out on inner and link roads across the municipalities. The deck records progress on the Budo City to Bogoso Junction inner road and in the Tamso electoral area, alongside road layout mapping for the Brenuakyem, Senyakrom and Cyanide areas.",
    outcomes: ["Total kilometres for Tarkwa Town roads is 10.27km."],
  },
  {
    slug: "sanitation-refuse-excavation",
    title: "Sanitation — Excavation of Refuse Across the Constituency",
    category: "Water & Sanitation",
    status: "Completed",
    community: "Constituency-wide",
    progress: 100,
    description:
      "Excavation and clearing of refuse dumps across the constituency, together with a donation of sanitation equipment to the Tarkwa Traffic Boyz.",
    story:
      "Refuse sites across the constituency were excavated and cleared, with the deck presenting a direct before-and-after comparison of one such site. Sanitation equipment was also donated to the Tarkwa Traffic Boyz for their clean-up work.",
    outcomes: [],
    beforeAfter: { before: 1, after: 2 },
  },
  {
    slug: "dustbin-donation-tarkwa-station",
    title: "Donation of Dustbins to Tarkwa Station",
    category: "Water & Sanitation",
    status: "Completed",
    community: "Tarkwa Station",
    progress: 100,
    description:
      "Donation of refuse bins to Tarkwa Station to support waste collection and keep the station area clean.",
    story:
      "Branded refuse bins were donated to Tarkwa Station so that waste generated around the station could be collected and contained rather than left to accumulate. The donation formed part of a wider clean-up exercise awareness launch across the constituency.",
    outcomes: [],
    // The deck's own slide 11 asset is a screenshot of press coverage; the clean
    // photograph of the bins was uploaded through the admin form, so it leads.
    extraImages: [
      "https://res.cloudinary.com/t3wvpyo8/image/upload/v1788168003/projects/gallery/ew8exix4tiieqfdnafyl.jpg",
    ],
    mainIndex: 2,
  },
  {
    // Slide 10 repeats slide 53's title verbatim, but its photos show a refuse
    // dump being cleared, not a sod-cutting. The slide gives no location, so
    // none is claimed here.
    slug: "refuse-dump-evacuation",
    title: "Evacuation of Refuse Dump",
    category: "Water & Sanitation",
    status: "Completed",
    community: TBC,
    progress: 100,
    description:
      "Clearing and evacuation of an accumulated refuse dump using heavy equipment.",
    story:
      "An accumulated refuse dump was cleared using heavy equipment, with the refuse excavated and hauled away and the site left open and usable again.",
    outcomes: [],
    beforeAfter: { before: 1, after: 5 },
    extraImages: [
      // Uploaded through the admin form: the cleared site.
      "https://res.cloudinary.com/t3wvpyo8/image/upload/v1788167858/projects/mj20hrf1xfcuk6pfc4hd.jpg",
    ],
  },
  {
    slug: "tarkwa-zongo-water-closet",
    title: "Sod-Cutting of 16-Seater Water Closet at Tarkwa Zongo",
    category: "Water & Sanitation",
    status: "Ongoing",
    community: "Tarkwa Zongo",
    progress: 0,
    description:
      "Sod-cutting for the construction of a 16-seater water closet facility at Tarkwa Zongo.",
    story:
      "The MP cut sod for a 16-seater water closet at Tarkwa Zongo to improve sanitation access for the community.",
    outcomes: [],
  },
  {
    slug: "network-connectivity-expansion",
    title: "Network Connectivity Expansion",
    category: "ICT",
    status: "Ongoing",
    community: "Bonsawire, Amanentin",
    progress: 98,
    description:
      "Extension of mobile network connectivity to Bonsawire and Amanentin.",
    story:
      "Network infrastructure work at Bonsawire and Amanentin is reported in the deck as 98% complete.",
    outcomes: ["Reported 98% complete."],
  },
  {
    slug: "agricultural-tools-supply",
    title: "Supply of Agricultural Tools to Farmers",
    category: "Agriculture",
    status: "Completed",
    community: "Farming communities",
    progress: 100,
    description:
      "Supply of agricultural tools to farmers across the constituency.",
    story:
      "Agricultural tools were supplied to farmers in the constituency to support their work on the land.",
    outcomes: [],
  },
  {
    slug: "palm-coconut-seedlings",
    title: "Supply of Palm and Coconut Seedlings to Farmers",
    category: "Agriculture",
    status: "Completed",
    community: "Farming communities",
    progress: 100,
    description:
      "Distribution of palm and coconut seedlings to hard-working farmers in the constituency.",
    story:
      "Palm and coconut seedlings were supplied to farmers across the constituency to support tree-crop cultivation.",
    outcomes: [],
  },
  {
    slug: "nkoko-nkitinkiti-poultry",
    title: "Nkoko Nkitinkiti Poultry Initiative",
    category: "Agriculture",
    status: "Completed",
    community: "Poultry farmers",
    progress: 100,
    description:
      "Supply of birds to poultry farmers under the Nkoko Nkitinkiti initiative.",
    story:
      "Under the Nkoko Nkitinkiti initiative, birds were supplied to hard-working poultry farmers in the constituency.",
    outcomes: [],
  },
  {
    slug: "medeama-sc-sports-support",
    title: "Support for Medeama SC",
    category: "Sports",
    status: "Completed",
    community: "Tarkwa-Nsuaem",
    progress: 100,
    description:
      "Support provided to Medeama SC towards winning the Ghana Premier League.",
    story:
      "The MP supported Medeama SC, the constituency's premier league side, in their successful campaign to win the Ghana Premier League.",
    outcomes: ["Supported Medeama SC to win the Ghana Premier League."],
  },
  {
    slug: "breast-cancer-screening-esuaso",
    title: "Free Breast Cancer Screening at Esuaso",
    category: "Health",
    status: "Completed",
    community: "Esuaso",
    progress: 100,
    description: "Free breast cancer screening exercise held at Esuaso.",
    story:
      "A free breast cancer screening exercise was organised at Esuaso, giving women in the community access to early detection services at no cost.",
    outcomes: [],
  },
  {
    slug: "health-equipment-donation",
    title: "Equipment Donation to Public Health Facilities",
    category: "Health",
    status: "Completed",
    community:
      "Selected public health facilities, including Apinto Government Hospital",
    progress: 100,
    description:
      "Donation of medical equipment to selected public health facilities in the constituency, including Apinto Government Hospital.",
    story:
      "Medical equipment valued at over US$793,000 was donated to selected public health facilities in the constituency, among them Apinto Government Hospital.",
    outcomes: ["Equipment valued at over US$793,000 donated."],
  },
  {
    slug: "school-desks-distribution",
    title: "Distribution of School Desks Across the Constituency",
    category: "Education",
    status: "Completed",
    community: "Constituency-wide",
    progress: 100,
    description:
      "Distribution of school desks to schools throughout the constituency.",
    story:
      "School desks were supplied and distributed to schools across the constituency, so that pupils who had been sitting on the floor or sharing worn furniture had somewhere proper to sit and write.",
    outcomes: [],
  },
  {
    slug: "classroom-block-dompim",
    title: "6-Unit Classroom Block at Nana Boadi Basic School, Dompim",
    category: "Education",
    status: "Completed",
    community: "Dompim",
    progress: 100,
    description:
      "A 6-unit classroom block built for Nana Boadi Basic School at Dompim.",
    story:
      "A 6-unit classroom block was provided for Nana Boadi Basic School at Dompim, giving the school additional teaching space of its own.",
    outcomes: [],
  },
  {
    slug: "islamic-shs-simpa",
    title: "Islamic Senior High School at Simpa",
    category: "Education",
    status: "Ongoing",
    community: "Simpa",
    progress: 0,
    description:
      "Sod-cutting and construction of an Islamic Senior High School at Simpa.",
    story:
      "The MP cut sod for an Islamic Senior High School at Simpa, and the deck records construction progress on the project since.",
    outcomes: [],
  },
  {
    slug: "student-fees-support",
    title: "Fees Support for Students",
    category: "Education",
    status: "Completed",
    community: "Students, including at UMaT",
    progress: 100,
    description:
      "Payment of fees in support of students, including students at the University of Mines and Technology (UMaT).",
    story:
      "Fees support was provided to students in the constituency, including students attending the University of Mines and Technology (UMaT).",
    outcomes: [],
  },
  {
    slug: "mp-interest-free-loans",
    title: "MP's Interest-Free Loans",
    category: "Economic Empowerment",
    status: "Ongoing",
    community: "Traders and market women",
    progress: 0,
    description:
      "Disbursement of interest-free loans to constituents, including market women.",
    story:
      "The MP's interest-free loan scheme has been disbursing funds to constituents, with the deck recording disbursement events and the market women who received support.",
    outcomes: [],
  },
  {
    slug: "transformer-replacement",
    title: "Replacement of Damaged Transformers",
    category: "Electricity",
    status: "Ongoing",
    community: "Constituency-wide",
    progress: 0,
    description:
      "Replacement of damaged transformers across the constituency to address power supply problems.",
    story:
      "Working through the Minister for Energy, the MP secured 33 transformers to address the power supply problems affecting communities in the constituency.",
    outcomes: ["33 transformers secured through the Minister for Energy."],
  },
  {
    slug: "street-lighting-project",
    title: "Street Lighting Across Tarkwa-Nsuaem",
    category: "Electricity",
    status: "Ongoing",
    community: "Constituency-wide, including senior high schools",
    progress: 0,
    description:
      "Installation of streetlights across Tarkwa-Nsuaem, including a donation of street lights to senior high schools.",
    story:
      "The MP secured 5,000 pieces of streetlights to light the streets of Tarkwa-Nsuaem, with street lights also donated across senior high schools in the constituency.",
    outcomes: ["5,000 pieces of streetlights secured."],
  },
  {
    slug: "youth-unemployment-programmes",
    title: "Youth Unemployment Interventions",
    category: "Youth Empowerment",
    status: "Ongoing",
    community: "Constituency youth",
    progress: 0,
    description:
      "Interventions addressing youth unemployment, including a skills training programme in collaboration with WISLAW Education, registration of youths for Y.E.A programmes, and recruitment into the security services.",
    story:
      "A set of interventions has targeted youth unemployment in the constituency: a skills training programme run in collaboration with WISLAW Education, registration of young people onto Youth Employment Agency programmes, and support for applicants entering the security services.",
    outcomes: ["About 37 applicants were recruited into the security services."],
  },
  {
    slug: "skills-training-simulators",
    title: "Skills Training Programme — Heavy Equipment Simulators",
    category: "Youth Empowerment",
    status: "Ongoing",
    community: "Constituency youth",
    progress: 0,
    description:
      "A skills training programme equipped with heavy equipment simulators, including dump truck, grader and dozer simulators, plus live equipment for use after training.",
    story:
      "Keys to a set of heavy equipment simulators were handed over for the skills training programme. The equipment includes dump truck, grader and dozer simulators alongside a live vehicle simulator, with live equipment provided for trainees to use after the simulator stage.",
    outcomes: ["Over 150 applicants have registered for the training."],
  },
  {
    slug: "youth-in-driving",
    title: "Youth in Driving",
    category: "Youth Empowerment",
    status: "Ongoing",
    community: "Constituency youth",
    progress: 0,
    description: "A driving programme for young people in the constituency.",
    story:
      "The Youth in Driving programme supports young people in the constituency through driving training.",
    outcomes: [],
  },
  {
    slug: "borehole-drilling",
    title: "Drilling of Boreholes in the Communities",
    category: "Water & Sanitation",
    status: "Ongoing",
    community: "Communities including Kadadwen",
    progress: 0,
    description:
      "Drilling of boreholes in communities across the constituency, including the Kadadwen water project.",
    story:
      "Boreholes are being drilled in communities across the constituency so that residents have closer access to water. The deck records the Kadadwen water project among the works carried out.",
    outcomes: [],
  },
  {
    slug: "anti-illegal-mining-support",
    title: "Support for the Fight Against Illegal Mining",
    category: "Environment",
    status: "Ongoing",
    community: "Tarkwa-Nsuaem Municipality, including the Bonsa River",
    progress: 0,
    description:
      "Donation of equipment, funds and two vehicles to the Ghana River Guard to enhance operations against illegal mining in the municipality.",
    story:
      "The MP donated equipment and funds to enhance the work of the Ghana River Guard, followed by two vehicles to strengthen the fight against illegal mining. The deck records River Guard operations in which equipment used by illegal miners was destroyed, including on the Bonsa River, carried out alongside the MCE.",
    outcomes: [
      "Two vehicles donated to the Ghana River Guard.",
      "Equipment used for illegal mining destroyed on the Bonsa River and at illegal mining sites.",
    ],
  },
  {
    slug: "cement-donations",
    title: "Cement Donations to Communities",
    category: "Roads",
    status: "Completed",
    community: "Kwabedu, Akoon, New Atuabo",
    progress: 100,
    description:
      "Donation of bags of cement to the Kwabedu, Akoon and New Atuabo communities, together with a weeding machine for Kwabedu.",
    story:
      "Bags of cement were donated to the Kwabedu, Akoon and New Atuabo communities in support of their community works, with a weeding machine also provided to Kwabedu.",
    outcomes: [],
  },
  {
    slug: "creative-art-support",
    title: "Creative Art Support",
    category: "Creative Arts",
    status: "Completed",
    community: "Tarkwa-Nsuaem creative artists",
    progress: 100,
    description:
      "Support for creative artists from the constituency, including Pasi and Quami Benji.",
    story:
      "The MP extended support to creative artists from the constituency, among them Pasi and Quami Benji.",
    outcomes: [],
  },
  {
    slug: "media-personalities-support",
    title: "Support for Media Personalities",
    category: "Media",
    status: "Completed",
    community: "Tarkwa-Nsuaem media",
    progress: 100,
    description: "Support extended to media personalities in the constituency.",
    story:
      "The MP provided support to media personalities working in the constituency.",
    outcomes: [],
  },
  {
    slug: "ghana-card-registration",
    title: "Free Ghana Card Registration",
    category: "Governance",
    status: "Ongoing",
    community: "Constituency-wide",
    progress: 0,
    description:
      "Free Ghana Card registration exercise held across the constituency.",
    story:
      "A free Ghana Card registration exercise was organised across the constituency so that residents could obtain the national identity card at no cost.",
    outcomes: [],
  },
];

// ── Image handling ──────────────────────────────────────────────────────────
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const STAGE_DIR = path.resolve(process.cwd(), "public", "deck-projects");

function getImageFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();
}

async function uploadFile(filePath: string, publicId: string): Promise<string> {
  const buffer = await sharp(filePath)
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, overwrite: false, resource_type: "image" },
      (error, result) =>
        error ? reject(error) : resolve(result?.secure_url || ""),
    );
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL is not set. Add it to .env.local.");
    process.exit(1);
  }

  if (DRY_RUN) console.log("DRY RUN — no uploads, no database writes.\n");

  const client = new Client({ connectionString: dbUrl });
  if (!DRY_RUN) {
    await client.connect();
    console.log("Connected to Neon PostgreSQL.");
  }

  // 1. Add the categories the deck needs that the seeded list does not carry.
  for (const name of NEW_CATEGORIES) {
    if (DRY_RUN) {
      console.log(`  [dry] add category "${name}"`);
      continue;
    }
    await client.query(
      `INSERT INTO categories (name, sort_order)
       SELECT $1, COALESCE(MAX(sort_order), 0) + 1 FROM categories
       ON CONFLICT DO NOTHING`,
      [name],
    );
  }
  console.log(`Categories ensured: ${NEW_CATEGORIES.join(", ")}\n`);

  // 2. Upload photos and upsert each project.
  let totalPhotos = 0;
  const targets = ONLY.length > 0 ? DEFS.filter((d) => ONLY.includes(d.slug)) : DEFS;
  if (ONLY.length > 0) {
    const unknown = ONLY.filter((s) => !DEFS.some((d) => d.slug === s));
    if (unknown.length > 0) {
      console.error(`ERROR: unknown --only slug(s): ${unknown.join(", ")}`);
      process.exit(1);
    }
    console.log(`Restricted to: ${targets.map((d) => d.slug).join(", ")}\n`);
  }

  for (const def of targets) {
    const folder = path.join(STAGE_DIR, def.slug);
    const files = getImageFiles(folder);
    if (files.length === 0) {
      console.warn(`No staged photos for "${def.slug}" — skipping.`);
      continue;
    }

    console.log(`${def.slug} (${files.length} photos)`);
    const urls: string[] = [];
    for (const file of files) {
      const publicId = `mp_projects/${def.slug}/${path.parse(file).name}`;
      if (DRY_RUN) {
        urls.push(`https://res.cloudinary.com/<cloud>/image/upload/${publicId}`);
        continue;
      }
      try {
        urls.push(await uploadFile(path.join(folder, file), publicId));
      } catch (err: any) {
        if (err?.http_code === 409 || String(err).includes("already exists")) {
          urls.push(cloudinary.url(publicId, { secure: true }));
        } else {
          console.error(`  Failed on ${file}:`, err?.message || err);
        }
      }
    }
    if (urls.length === 0) continue;
    // Admin-uploaded images are already hosted, so they are appended as-is.
    for (const extra of def.extraImages ?? []) urls.push(extra);
    totalPhotos += urls.length;

    // Use the deck's own before/after pair where it presents one; otherwise
    // fall back to the first two photos so the slider still has two frames.
    const beforeImage = def.beforeAfter
      ? urls[def.beforeAfter.before - 1]
      : urls[0];
    const afterImage = def.beforeAfter
      ? urls[def.beforeAfter.after - 1]
      : urls[1] || urls[0];

    const mainImage = urls[(def.mainIndex ?? 1) - 1] ?? urls[0];

    const gallery = urls.map((url, i) => ({
      title: `${def.title} — Photo ${i + 1}`,
      type: "Photo" as const,
      image: url,
    }));

    const row = [
      def.slug,
      def.title,
      def.category,
      def.status,
      def.community,
      0,
      "—",
      REPORTING_YEAR,
      def.progress,
      mainImage,
      beforeImage,
      afterImage,
      TBC,
      TBC,
      TBC,
      TBC,
      null,
      def.description,
      def.story,
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify(def.outcomes),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify(gallery),
      JSON.stringify(MAP),
    ];

    if (DRY_RUN) {
      console.log(
        `  [dry] upsert ${def.category} / ${def.status} / ${urls.length} gallery items`,
      );
      continue;
    }

    await client.query(
      `INSERT INTO projects (
         slug, title, category, status, community, budget, budget_label, year, progress,
         image, before_image, after_image, contractor, funding_source, start_date,
         expected_completion, completion_date, description, story, objectives,
         challenges, outcomes, timeline, updates, gallery, map
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
       ON CONFLICT (slug) DO UPDATE SET
         title=EXCLUDED.title, category=EXCLUDED.category, status=EXCLUDED.status,
         community=EXCLUDED.community, budget=EXCLUDED.budget, budget_label=EXCLUDED.budget_label,
         year=EXCLUDED.year, progress=EXCLUDED.progress, image=EXCLUDED.image,
         before_image=EXCLUDED.before_image, after_image=EXCLUDED.after_image,
         contractor=EXCLUDED.contractor, funding_source=EXCLUDED.funding_source,
         start_date=EXCLUDED.start_date, expected_completion=EXCLUDED.expected_completion,
         completion_date=EXCLUDED.completion_date, description=EXCLUDED.description,
         story=EXCLUDED.story, objectives=EXCLUDED.objectives, challenges=EXCLUDED.challenges,
         outcomes=EXCLUDED.outcomes, timeline=EXCLUDED.timeline, updates=EXCLUDED.updates,
         gallery=EXCLUDED.gallery, map=EXCLUDED.map`,
      row,
    );
    console.log(`  saved (${urls.length} photos)`);
  }

  // 3. Remove the seeded demo rows now that the real content is in. Skipped for
  // a targeted --only run, which is a fix to named projects, not a full import.
  if (ONLY.length > 0) {
    if (!DRY_RUN) await client.end();
    console.log(`\nDone. ${targets.length} project(s), ${totalPhotos} photos.`);
    return;
  }

  if (!DRY_RUN) {
    const del = await client.query(
      "DELETE FROM projects WHERE slug = ANY($1::text[])",
      [[...PLACEHOLDER_SLUGS, ...RETIRED_SLUGS]],
    );
    console.log(`\nRemoved ${del.rowCount} placeholder/retired project(s).`);
    const { rows } = await client.query(
      "SELECT COUNT(*)::int AS n FROM projects",
    );
    console.log(`Projects now in database: ${rows[0].n}`);
    await client.end();
  } else {
    console.log(
      `\n[dry] would remove ${PLACEHOLDER_SLUGS.length} placeholder projects.`,
    );
  }

  console.log(`Done. ${DEFS.length} projects, ${totalPhotos} photos.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
