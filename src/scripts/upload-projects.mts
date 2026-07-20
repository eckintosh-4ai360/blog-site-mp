/**
 * upload-projects.ts
 *
 * Uploads all images from public/<folder>/* to Cloudinary under the
 * mp_projects/<folder-slug> folder, then inserts each project into the
 * Neon `projects` table.
 *
 * Run with:
 *   npx ts-node --project tsconfig.node.json src/scripts/upload-projects.ts
 *   -- or via the npm script "upload-projects"
 *
 * Requires DATABASE_URL in .env.local (or system env).
 */

import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { Client, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import sharp from "sharp";
import { Readable } from "stream";

// Polyfill WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Load .env.local manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || "").trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    }
    console.log("Loaded .env.local");
  }
}
loadEnv();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "t3wvpyo8",
  api_key: process.env.CLOUDINARY_API_KEY || "879727156825485",
  api_secret: process.env.CLOUDINARY_API_SECRET || "2DEECi00gScMG50LInzHCVOuIOc",
  secure: true,
});

// Project definitions per folder
interface ProjectDef {
  folder: string;
  slug: string;
  title: string;
  category: string;
  status: "Completed" | "Ongoing" | "Planned" | "On Hold" | "Archived";
  community: string;
  budget: number;
  budgetLabel: string;
  year: string;
  progress: number;
  contractor: string;
  fundingSource: string;
  startDate: string;
  expectedCompletion: string;
  completionDate?: string;
  description: string;
  story: string;
  objectives: string[];
  challenges: string[];
  outcomes: string[];
}

const PROJECT_DEFS: ProjectDef[] = [
  {
    folder: "Health",
    slug: "community-health-outreach",
    title: "Community Health Outreach & Support Programme",
    category: "Health",
    status: "Completed",
    community: "Various Communities",
    budget: 850000,
    budgetLabel: "GHS 850K",
    year: "2024",
    progress: 100,
    contractor: "Ministry of Health / MP Office",
    fundingSource: "MP Common Fund",
    startDate: "01 Mar 2024",
    expectedCompletion: "30 Nov 2024",
    completionDate: "28 Nov 2024",
    description:
      "A comprehensive health outreach programme providing free medical screenings, health education, medications, and referrals to community members across the constituency.",
    story:
      "Many residents could not afford hospital visits for routine check-ups. The MP's health outreach initiative brought medical teams directly into communities, screening hundreds of residents for hypertension, diabetes, and other preventable conditions, while distributing medications and referring critical cases to district hospitals.",
    objectives: [
      "Provide free health screenings to at least 2,000 residents.",
      "Distribute essential medications to those who cannot afford them.",
      "Educate communities on preventive health practices.",
    ],
    challenges: [
      "Coordinating medical teams across multiple communities on the same day.",
      "Limited cold-chain storage for temperature-sensitive medications.",
    ],
    outcomes: [
      "Over 2,400 residents screened across 8 communities.",
      "1,800 people received free medications and health supplies.",
      "320 critical cases referred to district and regional hospitals.",
    ],
  },
  {
    folder: "Youth in driving",
    slug: "youth-road-safety-driving",
    title: "Youth Road Safety & Driving Empowerment Programme",
    category: "Youth Empowerment",
    status: "Completed",
    community: "Constituency Youth",
    budget: 420000,
    budgetLabel: "GHS 420K",
    year: "2024",
    progress: 100,
    contractor: "National Road Safety Authority (NRSA)",
    fundingSource: "MP Common Fund & NRSA",
    startDate: "05 Jun 2024",
    expectedCompletion: "30 Sep 2024",
    completionDate: "25 Sep 2024",
    description:
      "A youth empowerment initiative that trained and sponsored young constituents in professional driving, road safety, and vehicle maintenance to improve employment prospects.",
    story:
      "Unemployed youth identified driving as a viable career path but lacked the funds for lessons and licensing. The MP partnered with the NRSA to sponsor driving lessons, testing fees, and licensing costs for deserving young people, opening doors to formal employment in transportation.",
    objectives: [
      "Sponsor at least 100 young people through full driving certification.",
      "Educate youth on road safety laws and responsible driving.",
      "Connect certified drivers with employment opportunities.",
    ],
    challenges: [
      "High demand exceeded initial intake slots, requiring a second cohort.",
      "Some participants needed literacy support to pass theory tests.",
    ],
    outcomes: [
      "148 youth successfully licensed as certified drivers.",
      "Over 90% of graduates secured employment within 3 months.",
      "Road safety awareness sessions reached 600 additional community members.",
    ],
  },
  {
    folder: "cement donation",
    slug: "cement-donation-programme",
    title: "Cement Materials Donation to Community Self-Help Projects",
    category: "Roads",
    status: "Completed",
    community: "Multiple Communities",
    budget: 310000,
    budgetLabel: "GHS 310K",
    year: "2024",
    progress: 100,
    contractor: "Community Self-Help Groups",
    fundingSource: "MP Common Fund",
    startDate: "10 Jan 2024",
    expectedCompletion: "31 Mar 2024",
    completionDate: "29 Mar 2024",
    description:
      "Donation of cement bags and construction materials to community groups undertaking self-help infrastructure projects including drainage, footpaths, and community centres.",
    story:
      "Community groups across the constituency were engaged in self-help construction initiatives but lacked materials to complete their projects. The MP intervened by supplying cement and materials, enabling communities to finish critical infrastructure that would have otherwise remained incomplete.",
    objectives: [
      "Supply cement and materials to active self-help projects.",
      "Accelerate completion of community-initiated infrastructure.",
      "Empower community groups through material support.",
    ],
    challenges: [
      "Transportation of materials to remote communities required special logistics.",
      "Prioritisation of most impactful projects across many applicants.",
    ],
    outcomes: [
      "Over 500 bags of cement distributed to 12 community groups.",
      "8 self-help projects successfully completed with the support.",
      "Approximately 3,200 residents benefited from completed infrastructure.",
    ],
  },
  {
    folder: "donation sewing mach",
    slug: "sewing-machine-donation",
    title: "Sewing Machine Donation to Women & Youth Groups",
    category: "Youth Empowerment",
    status: "Completed",
    community: "Women & Youth Groups",
    budget: 280000,
    budgetLabel: "GHS 280K",
    year: "2024",
    progress: 100,
    contractor: "MP Office",
    fundingSource: "MP Common Fund",
    startDate: "15 Feb 2024",
    expectedCompletion: "30 Apr 2024",
    completionDate: "22 Apr 2024",
    description:
      "Donation of industrial and domestic sewing machines to women's groups and youth cooperatives to boost income-generating activities in fashion and textiles.",
    story:
      "Women and youth in the constituency had skills in dressmaking and tailoring but lacked equipment to scale their work. The MP donated sewing machines to organised groups, enabling them to take on larger orders, create employment, and increase their incomes sustainably.",
    objectives: [
      "Equip women and youth groups with sewing machines for income generation.",
      "Support existing tailoring and fashion cooperatives.",
      "Create pathways to self-employment through equipment access.",
    ],
    challenges: [
      "Training sessions were required to orient groups on industrial machine operation.",
      "Storage and maintenance responsibilities had to be formalised within groups.",
    ],
    outcomes: [
      "Over 40 sewing machines distributed to 15 groups.",
      "More than 200 women and youth directly benefited.",
      "Several groups reported 60% increase in monthly income within 6 months.",
    ],
  },
  {
    folder: "donation transformers",
    slug: "transformer-donation-electricity",
    title: "Electrical Transformer Donation for Community Power Supply",
    category: "Electricity",
    status: "Completed",
    community: "Underserved Communities",
    budget: 950000,
    budgetLabel: "GHS 950K",
    year: "2024",
    progress: 100,
    contractor: "Electricity Company of Ghana (ECG)",
    fundingSource: "MP Common Fund & ECG",
    startDate: "08 Apr 2024",
    expectedCompletion: "31 Jul 2024",
    completionDate: "18 Jul 2024",
    description:
      "Procurement and installation of electrical transformers in communities suffering from unreliable power supply or lacking electricity access entirely.",
    story:
      "Several communities in the constituency had been without electricity or suffered from frequent outages due to overloaded or non-functional transformers. The MP facilitated the procurement and installation of new transformers in partnership with ECG, restoring and extending reliable electricity supply.",
    objectives: [
      "Install new transformers in communities with poor or no electricity access.",
      "Reduce power outages affecting households and businesses.",
      "Improve quality of life and support small businesses through reliable power.",
    ],
    challenges: [
      "ECG installation scheduling required coordination over several months.",
      "Some sites required preparatory pole and cable infrastructure works.",
    ],
    outcomes: [
      "6 transformers successfully installed across 6 communities.",
      "Approximately 4,500 households gained improved electricity access.",
      "Local businesses reported significant reduction in generator fuel costs.",
    ],
  },
  {
    folder: "farm",
    slug: "constituency-farming-initiative",
    title: "Constituency Community Farming & Agricultural Support",
    category: "Agriculture",
    status: "Ongoing",
    community: "Farming Communities",
    budget: 620000,
    budgetLabel: "GHS 620K",
    year: "2024",
    progress: 75,
    contractor: "Ministry of Food & Agriculture",
    fundingSource: "MP Common Fund & MoFA",
    startDate: "01 Feb 2024",
    expectedCompletion: "31 Dec 2024",
    description:
      "A constituency-wide agricultural initiative providing farmers with seedlings, fertilisers, farm inputs, and technical support to boost crop yields and food security.",
    story:
      "Smallholder farmers in the constituency struggled with rising input costs and limited access to extension services. Through this initiative, the MP supplied subsidised inputs and organised field demonstrations by agricultural extension officers to help farmers improve productivity and earn more from their plots.",
    objectives: [
      "Supply quality seedlings and fertilisers to smallholder farmers.",
      "Provide technical training through agricultural extension officers.",
      "Boost food production and reduce post-harvest losses.",
    ],
    challenges: [
      "Coordinating the delivery of perishable seedlings across dispersed farm locations.",
      "Some farmers required additional mentorship to adopt new techniques.",
    ],
    outcomes: [
      "Over 350 farming households received inputs and support.",
      "Participating farmers reported average yield increases of 40%.",
      "5 demonstration farms established for ongoing community learning.",
    ],
  },
  {
    folder: "network",
    slug: "constituency-network-connectivity",
    title: "Constituency Network & Connectivity Programme",
    category: "ICT",
    status: "Ongoing",
    community: "Constituency-wide",
    budget: 780000,
    budgetLabel: "GHS 780K",
    year: "2024",
    progress: 60,
    contractor: "Ghana Investment Fund for Electronic Communications (GIFEC)",
    fundingSource: "MP Common Fund & GIFEC",
    startDate: "01 Sep 2024",
    expectedCompletion: "28 Feb 2025",
    description:
      "Expansion of broadband and mobile network connectivity to underserved communities in the constituency to bridge the digital divide.",
    story:
      "Communities in outlying areas lacked reliable internet and mobile coverage, cutting residents off from digital services, online learning, and e-government platforms. The MP advocated and co-funded network expansion to bring connectivity to communities that had been bypassed by service providers.",
    objectives: [
      "Extend mobile and broadband coverage to underserved areas.",
      "Establish public Wi-Fi access points at key community locations.",
      "Enable residents to access digital services, education, and commerce.",
    ],
    challenges: [
      "Infrastructure installation in hilly terrain required specialised equipment.",
      "Community buy-in and coordination with telcos required sustained engagement.",
    ],
    outcomes: [
      "Coverage extended to 4 previously unserved communities.",
      "3 public Wi-Fi access points installed at community centres.",
      "Estimated 6,000 additional residents gained reliable connectivity.",
    ],
  },
  {
    folder: "reshapping innerroads",
    slug: "reshaping-inner-roads",
    title: "Reshaping & Rehabilitation of Inner Community Roads",
    category: "Roads",
    status: "Completed",
    community: "Inner Community Areas",
    budget: 1450000,
    budgetLabel: "GHS 1.45M",
    year: "2024",
    progress: 100,
    contractor: "Department of Urban Roads",
    fundingSource: "MP Common Fund & District Assembly",
    startDate: "03 Mar 2024",
    expectedCompletion: "31 Aug 2024",
    completionDate: "19 Aug 2024",
    description:
      "Grading, reshaping, and gravelling of inner community roads to improve accessibility for residents, especially during the rainy season.",
    story:
      "Inner community roads had deteriorated significantly, becoming impassable during rains and causing hardship for residents and emergency services. The MP mobilised road equipment and materials to reshape and reinstate these critical access routes, restoring mobility and safety for thousands of community members.",
    objectives: [
      "Reshape and reinstate heavily degraded inner community roads.",
      "Improve drainage to reduce flooding and road damage.",
      "Restore reliable access for residents, vehicles, and emergency services.",
    ],
    challenges: [
      "Accessing some roads with heavy equipment required temporary diversions.",
      "Rainy season scheduling required work to be completed in windows of dry weather.",
    ],
    outcomes: [
      "Over 24km of inner community roads reshaped and reinstated.",
      "12 communities gained improved year-round road access.",
      "Emergency response times in affected areas significantly improved.",
    ],
  },
  {
    folder: "water proj",
    slug: "water-access-project",
    title: "Community Water Access & Borehole Project",
    category: "Water & Sanitation",
    status: "Completed",
    community: "Water-stressed Communities",
    budget: 1120000,
    budgetLabel: "GHS 1.12M",
    year: "2024",
    progress: 100,
    contractor: "Community Water & Sanitation Agency (CWSA)",
    fundingSource: "MP Common Fund & CWSA",
    startDate: "10 Jan 2024",
    expectedCompletion: "30 Jun 2024",
    completionDate: "15 Jun 2024",
    description:
      "Construction of boreholes, installation of hand pumps, and provision of water storage facilities to give communities reliable access to safe drinking water.",
    story:
      "Communities dependent on unsafe surface water sources or walking long distances for water saw their lives transformed by this project. New boreholes and water systems provided clean, reliable water close to homes, reducing waterborne illness, easing the burden on women and children, and freeing time for productive activities.",
    objectives: [
      "Drill and equip boreholes in water-stressed communities.",
      "Install hand pumps and storage tanks for community water supply.",
      "Train community water committees for system maintenance.",
    ],
    challenges: [
      "Drilling conditions varied significantly between sites.",
      "Community mobilisation for maintenance training required patience.",
    ],
    outcomes: [
      "8 functional boreholes successfully drilled and equipped.",
      "Approximately 9,500 residents now have access to clean water.",
      "Average water collection time reduced from over 1 hour to under 15 minutes.",
    ],
  },
];

// Image extensions to accept
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function getImageFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();
}

// Upload a single local file to Cloudinary with local compression
async function uploadFile(
  filePath: string,
  publicId: string
): Promise<string> {
  const buffer = await sharp(filePath)
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: false,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

// Slug helper
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Main function
async function main() {
  // Prefer unpooled for scripts (more reliable for long-running Node.js processes)
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error(
      "ERROR: DATABASE_URL is not set. Please add it to .env.local or your system environment."
    );
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log("Connected to Neon PostgreSQL");

  const publicDir = path.resolve(process.cwd(), "public");

  for (const def of PROJECT_DEFS) {
    const folderPath = path.join(publicDir, def.folder);
    const imageFiles = getImageFiles(folderPath);

    if (imageFiles.length === 0) {
      console.warn(`No images found in "${def.folder}" — skipping.`);
      continue;
    }

    console.log(
      `\nProcessing "${def.folder}" (${imageFiles.length} images)...`
    );

    const cloudinaryFolder = `mp_projects/${toSlug(def.folder)}`;
    const uploadedUrls: string[] = [];

    for (const imgFile of imageFiles) {
      const filePath = path.join(folderPath, imgFile);
      const fileSlug = toSlug(path.parse(imgFile).name);
      const publicId = `${cloudinaryFolder}/${fileSlug}`;

      try {
        console.log(`  Uploading ${imgFile}...`);
        const url = await uploadFile(filePath, publicId);
        uploadedUrls.push(url);
        console.log(`     OK: ${url}`);
      } catch (err: any) {
        if (err?.http_code === 409 || String(err).includes("already exists")) {
          const existingUrl = cloudinary.url(publicId, { secure: true });
          uploadedUrls.push(existingUrl);
          console.log(`     Already uploaded — using: ${existingUrl}`);
        } else {
          console.error(
            `     Failed to upload ${imgFile}:`,
            err?.message || err
          );
        }
      }
    }

    if (uploadedUrls.length === 0) {
      console.warn(
        `No images uploaded for "${def.folder}" — skipping DB insert.`
      );
      continue;
    }

    const mainImage = uploadedUrls[0];
    const beforeImage = uploadedUrls[0];
    const afterImage =
      uploadedUrls.length > 1 ? uploadedUrls[1] : uploadedUrls[0];

    const gallery = uploadedUrls.map((url, i) => ({
      title: `${def.title} — Photo ${i + 1}`,
      type: "Photo" as const,
      image: url,
    }));

    const timeline = [
      { label: "Proposal", date: "2024", done: true },
      { label: "Funding Approved", date: "2024", done: true },
      { label: "Ground Breaking", date: def.startDate, done: true },
      {
        label: "Completed",
        date: def.completionDate || def.expectedCompletion,
        done: def.status === "Completed",
      },
    ];

    const updates = [
      {
        date: def.completionDate || def.expectedCompletion,
        text: `${def.title} successfully completed.`,
      },
    ];

    const map = { lat: 5.6037, lng: -0.187, x: 50, y: 50 };

    const existing = await client.query(
      "SELECT slug FROM projects WHERE slug = $1",
      [def.slug]
    );

    if (existing.rows.length > 0) {
      await client.query(
        `UPDATE projects SET
          title=$2, category=$3, status=$4, community=$5, budget=$6, budget_label=$7,
          year=$8, progress=$9, image=$10, before_image=$11, after_image=$12,
          contractor=$13, funding_source=$14, start_date=$15, expected_completion=$16,
          completion_date=$17, description=$18, story=$19, objectives=$20,
          challenges=$21, outcomes=$22, timeline=$23, updates=$24, gallery=$25, map=$26
        WHERE slug=$1`,
        [
          def.slug,
          def.title,
          def.category,
          def.status,
          def.community,
          def.budget,
          def.budgetLabel,
          def.year,
          def.progress,
          mainImage,
          beforeImage,
          afterImage,
          def.contractor,
          def.fundingSource,
          def.startDate,
          def.expectedCompletion,
          def.completionDate || null,
          def.description,
          def.story,
          JSON.stringify(def.objectives),
          JSON.stringify(def.challenges),
          JSON.stringify(def.outcomes),
          JSON.stringify(timeline),
          JSON.stringify(updates),
          JSON.stringify(gallery),
          JSON.stringify(map),
        ]
      );
      console.log(`  Updated project "${def.slug}" in DB.`);
    } else {
      await client.query(
        `INSERT INTO projects (
          slug, title, category, status, community, budget, budget_label, year, progress,
          image, before_image, after_image, contractor, funding_source, start_date,
          expected_completion, completion_date, description, story, objectives,
          challenges, outcomes, timeline, updates, gallery, map
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
        [
          def.slug,
          def.title,
          def.category,
          def.status,
          def.community,
          def.budget,
          def.budgetLabel,
          def.year,
          def.progress,
          mainImage,
          beforeImage,
          afterImage,
          def.contractor,
          def.fundingSource,
          def.startDate,
          def.expectedCompletion,
          def.completionDate || null,
          def.description,
          def.story,
          JSON.stringify(def.objectives),
          JSON.stringify(def.challenges),
          JSON.stringify(def.outcomes),
          JSON.stringify(timeline),
          JSON.stringify(updates),
          JSON.stringify(gallery),
          JSON.stringify(map),
        ]
      );
      console.log(`  Inserted project "${def.slug}" into DB.`);
    }
  }

  await client.end();
  console.log("\nAll done! Projects uploaded to Cloudinary and saved to Neon.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
