export type ProjectStatus =
  | "Completed"
  | "Ongoing"
  | "Planned"
  | "On Hold"
  | "Archived";

export type Project = {
  slug: string;
  title: string;
  category: string;
  status: ProjectStatus;
  community: string;
  budget: number;
  budgetLabel: string;
  year: string;
  progress: number;
  image: string;
  beforeImage: string;
  afterImage: string;
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
  timeline: {
    label: string;
    date: string;
    done: boolean;
  }[];
  updates: {
    date: string;
    text: string;
  }[];
  gallery: {
    title: string;
    type: "Photo" | "Video" | "Drone" | "Document";
    image: string;
  }[];
  map: {
    lat: number;
    lng: number;
    x: number;
    y: number;
  };
};

export const categories = [
  "Education",
  "Health",
  "Roads",
  "Water & Sanitation",
  "Agriculture",
  "Youth Empowerment",
  "ICT",
  "Electricity",
  "Markets",
  "Sports",
  "Security",
  "Environment",
];

export const statuses: ProjectStatus[] = [
  "Completed",
  "Ongoing",
  "Planned",
  "On Hold",
  "Archived",
];

export const projects: Project[] = [
  {
    slug: "adom-new-town-stem-block",
    title: "Adom New Town STEM Classroom Block",
    category: "Education",
    status: "Completed",
    community: "Adom New Town",
    budget: 12400000,
    budgetLabel: "GHS 12.4M",
    year: "2025",
    progress: 100,
    image:
      "/bg_sheik.jpg",
    beforeImage:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1400&q=80",
    contractor: "Kobena Works Ltd.",
    fundingSource: "GETFund and MP Common Fund",
    startDate: "15 Jan 2025",
    expectedCompletion: "31 Oct 2025",
    completionDate: "18 Sep 2025",
    description:
      "A 12-classroom STEM-ready block with science labs, ICT room, accessible washrooms, and solar-assisted power.",
    story:
      "The school previously ran a shift system because enrolment had outgrown available classrooms. The new block expands teaching space, introduces practical STEM learning, and gives students safer facilities close to home.",
    objectives: [
      "Eliminate the morning and afternoon shift system.",
      "Improve access to science and digital learning.",
      "Provide accessible sanitation and safer circulation.",
    ],
    challenges: [
      "Delayed roofing materials during peak rainy season.",
      "Temporary relocation of two classes during construction.",
    ],
    outcomes: [
      "1,280 students now learn in single-shift classrooms.",
      "Science practical lessons increased from monthly to weekly.",
      "Girls' attendance improved after accessible washrooms opened.",
    ],
    timeline: [
      { label: "Proposal", date: "Oct 2024", done: true },
      { label: "Funding Approved", date: "Dec 2024", done: true },
      { label: "Ground Breaking", date: "Jan 2025", done: true },
      { label: "Construction", date: "Feb-Jul 2025", done: true },
      { label: "Inspection", date: "Aug 2025", done: true },
      { label: "Commissioning", date: "Sep 2025", done: true },
      { label: "Completed", date: "Sep 2025", done: true },
    ],
    updates: [
      { date: "18 Sep 2025", text: "Classrooms opened for the new term." },
      { date: "02 Aug 2025", text: "Final safety inspection completed." },
      { date: "21 Jun 2025", text: "Science lab furniture delivered." },
    ],
    gallery: [
      {
        title: "Completed classroom frontage",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "ICT room setup",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Commissioning ceremony",
        type: "Video",
        image:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    map: { lat: 5.6037, lng: -0.187, x: 32, y: 38 },
  },
  {
    slug: "market-link-road-upgrade",
    title: "Market Link Road Asphalt Upgrade",
    category: "Roads",
    status: "Ongoing",
    community: "Ahenfie Market",
    budget: 28500000,
    budgetLabel: "GHS 28.5M",
    year: "2026",
    progress: 72,
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    beforeImage:
      "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&w=1400&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    contractor: "Atlas Civil Engineering",
    fundingSource: "Road Fund and District Assembly",
    startDate: "07 Feb 2026",
    expectedCompletion: "30 Nov 2026",
    description:
      "A 7.8km asphalt upgrade with drains, pedestrian crossings, solar streetlights, and market access lay-bys.",
    story:
      "The corridor links farmers, traders, transport operators, and health services. Upgrading it reduces travel time, keeps food supply moving in the rainy season, and improves safety for pedestrians around the market.",
    objectives: [
      "Reduce market access travel time by at least 35 percent.",
      "Improve drainage along flood-prone road sections.",
      "Add safe pedestrian crossings at market and school zones.",
    ],
    challenges: [
      "Utility relocation around the market junction.",
      "Maintaining trader access while drains are constructed.",
    ],
    outcomes: [
      "Expected to serve 41,000 daily road users.",
      "Projected 28 percent reduction in transport spoilage losses.",
      "Solar lighting planned for 64 high-risk points.",
    ],
    timeline: [
      { label: "Proposal", date: "Aug 2025", done: true },
      { label: "Funding Approved", date: "Dec 2025", done: true },
      { label: "Ground Breaking", date: "Feb 2026", done: true },
      { label: "Construction", date: "Mar-Sep 2026", done: true },
      { label: "Inspection", date: "Oct 2026", done: false },
      { label: "Commissioning", date: "Nov 2026", done: false },
      { label: "Completed", date: "Nov 2026", done: false },
    ],
    updates: [
      { date: "28 Jun 2026", text: "Binder course completed on 4.1km." },
      { date: "14 May 2026", text: "Main storm drains installed near the market." },
      { date: "02 Apr 2026", text: "Utility relocation completed at Junction 3." },
    ],
    gallery: [
      {
        title: "Drain construction",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Aerial progress view",
        type: "Drone",
        image:
          "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Traffic management plan",
        type: "Document",
        image:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    map: { lat: 5.615, lng: -0.205, x: 58, y: 48 },
  },
  {
    slug: "nkwanta-community-clinic",
    title: "Nkwanta Community Clinic Expansion",
    category: "Health",
    status: "Ongoing",
    community: "Nkwanta",
    budget: 17600000,
    budgetLabel: "GHS 17.6M",
    year: "2026",
    progress: 84,
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=80",
    beforeImage:
      "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1400&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=80",
    contractor: "MedBuild Ghana",
    fundingSource: "NHIA Facility Grant",
    startDate: "21 Nov 2025",
    expectedCompletion: "15 Aug 2026",
    description:
      "Expansion of the clinic with maternity beds, emergency triage, pharmacy storage, laboratory, and staff accommodation.",
    story:
      "Nkwanta residents often travelled to the municipal hospital for basic diagnostics and maternity support. The expansion brings essential services closer to families and reduces pressure on referral facilities.",
    objectives: [
      "Add 18 maternity and observation beds.",
      "Create triage and laboratory capacity at community level.",
      "Improve medicine storage and staff retention.",
    ],
    challenges: [
      "Specialized equipment procurement required longer lead time.",
      "Work was phased to keep the existing clinic open.",
    ],
    outcomes: [
      "Expected to serve 22,000 residents annually.",
      "Emergency referral time projected to fall by 40 percent.",
      "Antenatal visits can be handled locally after commissioning.",
    ],
    timeline: [
      { label: "Proposal", date: "May 2025", done: true },
      { label: "Funding Approved", date: "Sep 2025", done: true },
      { label: "Ground Breaking", date: "Nov 2025", done: true },
      { label: "Construction", date: "Dec 2025-Jun 2026", done: true },
      { label: "Inspection", date: "Jul 2026", done: false },
      { label: "Commissioning", date: "Aug 2026", done: false },
      { label: "Completed", date: "Aug 2026", done: false },
    ],
    updates: [
      { date: "24 Jun 2026", text: "Clinic equipment list approved." },
      { date: "06 Jun 2026", text: "Roofing and internal partitions completed." },
      { date: "19 Apr 2026", text: "Laboratory wing reached lintel level." },
    ],
    gallery: [
      {
        title: "New emergency wing",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Health outreach day",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Equipment delivery brief",
        type: "Document",
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    map: { lat: 5.594, lng: -0.168, x: 72, y: 28 },
  },
  {
    slug: "beposo-solar-water-system",
    title: "Beposo Solar Water System",
    category: "Water & Sanitation",
    status: "Completed",
    community: "Beposo",
    budget: 6900000,
    budgetLabel: "GHS 6.9M",
    year: "2024",
    progress: 100,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    beforeImage:
      "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1400&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    contractor: "BlueSpring Engineering",
    fundingSource: "Water Access Partnership",
    startDate: "08 Mar 2024",
    expectedCompletion: "30 Sep 2024",
    completionDate: "12 Sep 2024",
    description:
      "Solar-powered borehole, elevated storage, community standpipes, and water quality monitoring for five settlements.",
    story:
      "Families in Beposo depended on seasonal streams and long walks for water. The solar system creates a reliable supply, reduces waterborne illness risks, and frees time for school and work.",
    objectives: [
      "Provide year-round safe water within walking distance.",
      "Reduce household water collection time.",
      "Introduce community-led maintenance and quality checks.",
    ],
    challenges: [
      "Rocky drilling conditions required a second borehole attempt.",
      "Community standpipe locations were revised after consultations.",
    ],
    outcomes: [
      "8,600 residents have improved daily water access.",
      "Average water collection time fell from 54 minutes to 13 minutes.",
      "Five water committees trained for maintenance reporting.",
    ],
    timeline: [
      { label: "Proposal", date: "Nov 2023", done: true },
      { label: "Funding Approved", date: "Jan 2024", done: true },
      { label: "Ground Breaking", date: "Mar 2024", done: true },
      { label: "Construction", date: "Apr-Aug 2024", done: true },
      { label: "Inspection", date: "Aug 2024", done: true },
      { label: "Commissioning", date: "Sep 2024", done: true },
      { label: "Completed", date: "Sep 2024", done: true },
    ],
    updates: [
      { date: "12 Sep 2024", text: "Water system commissioned." },
      { date: "19 Aug 2024", text: "Water quality test passed." },
      { date: "06 Jul 2024", text: "Solar array mounted and connected." },
    ],
    gallery: [
      {
        title: "Solar pump site",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Community standpipe",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Water quality certificate",
        type: "Document",
        image:
          "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    map: { lat: 5.637, lng: -0.224, x: 46, y: 70 },
  },
  {
    slug: "youth-digital-work-hub",
    title: "Youth Digital Work Hub",
    category: "Youth Empowerment",
    status: "Planned",
    community: "Kokomlemle",
    budget: 9400000,
    budgetLabel: "GHS 9.4M",
    year: "2027",
    progress: 18,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    beforeImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    contractor: "Pending procurement",
    fundingSource: "Digital Skills Fund",
    startDate: "Expected Jan 2027",
    expectedCompletion: "Expected Dec 2027",
    description:
      "A digital skills, freelancing, and enterprise support hub with co-working space, training lab, podcast studio, and mentorship rooms.",
    story:
      "Young people requested practical pathways from training into income. The hub will connect digital literacy, remote work readiness, entrepreneurship support, and public-private mentorship.",
    objectives: [
      "Train 1,500 young people in employable digital skills.",
      "Create a structured pathway into freelancing and apprenticeships.",
      "Offer affordable workspace for youth-led enterprises.",
    ],
    challenges: [
      "Final site lease documentation is under review.",
      "Procurement will prioritize equipment durability and maintenance.",
    ],
    outcomes: [
      "Projected 600 paid placements in the first two years.",
      "Mentorship desk planned for startups and creative workers.",
      "Community podcast studio to support civic information access.",
    ],
    timeline: [
      { label: "Proposal", date: "Feb 2026", done: true },
      { label: "Funding Approved", date: "Pending", done: false },
      { label: "Ground Breaking", date: "Jan 2027", done: false },
      { label: "Construction", date: "2027", done: false },
      { label: "Inspection", date: "Nov 2027", done: false },
      { label: "Commissioning", date: "Dec 2027", done: false },
      { label: "Completed", date: "Dec 2027", done: false },
    ],
    updates: [
      { date: "15 Jun 2026", text: "Site validation completed." },
      { date: "23 Apr 2026", text: "Youth stakeholder forum held." },
      { date: "11 Mar 2026", text: "Concept note submitted to partners." },
    ],
    gallery: [
      {
        title: "Training lab concept",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Youth engagement session",
        type: "Video",
        image:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Hub concept brief",
        type: "Document",
        image:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    map: { lat: 5.575, lng: -0.202, x: 22, y: 66 },
  },
  {
    slug: "green-market-solar-lighting",
    title: "Green Market Solar Lighting",
    category: "Markets",
    status: "On Hold",
    community: "Anidaso Market",
    budget: 5100000,
    budgetLabel: "GHS 5.1M",
    year: "2026",
    progress: 36,
    image:
      "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1400&q=80",
    beforeImage:
      "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1400&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1400&q=80",
    contractor: "BrightGrid Energy",
    fundingSource: "Climate Resilience Grant",
    startDate: "12 Jan 2026",
    expectedCompletion: "Revised date pending",
    description:
      "Solar lighting, rewired stalls, emergency lighting, and waste sorting points for safer evening trading.",
    story:
      "Women traders asked for safer lighting and reliable power around the market. The project is paused while the assembly resolves a meter separation issue with the utility provider.",
    objectives: [
      "Improve market safety after dusk.",
      "Reduce generator use and electricity costs.",
      "Introduce safer wiring and emergency lighting.",
    ],
    challenges: [
      "Utility meter separation has delayed final connection.",
      "Additional fire safety recommendations are being integrated.",
    ],
    outcomes: [
      "Expected to benefit 2,400 traders and customers daily.",
      "Projected to cut generator use by 70 percent.",
      "Emergency lighting to cover all primary aisles.",
    ],
    timeline: [
      { label: "Proposal", date: "Jul 2025", done: true },
      { label: "Funding Approved", date: "Oct 2025", done: true },
      { label: "Ground Breaking", date: "Jan 2026", done: true },
      { label: "Construction", date: "Paused", done: false },
      { label: "Inspection", date: "Pending", done: false },
      { label: "Commissioning", date: "Pending", done: false },
      { label: "Completed", date: "Pending", done: false },
    ],
    updates: [
      { date: "09 Jun 2026", text: "Utility separation meeting scheduled." },
      { date: "16 Apr 2026", text: "Fire safety addendum received." },
      { date: "02 Mar 2026", text: "Main aisle poles installed." },
    ],
    gallery: [
      {
        title: "Market aisle assessment",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Solar lighting sample",
        type: "Photo",
        image:
          "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Safety addendum",
        type: "Document",
        image:
          "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    map: { lat: 5.625, lng: -0.191, x: 66, y: 74 },
  },
];

export const constituencyStats = [
  { label: "Total Projects", value: "152", note: "Across 87 communities" },
  { label: "Completed Projects", value: "96", note: "Audited and commissioned" },
  { label: "Ongoing Projects", value: "34", note: "Updated every fortnight" },
  { label: "Planned Projects", value: "22", note: "In funding or procurement" },
  { label: "Schools Built", value: "15", note: "Classrooms and labs" },
  { label: "Roads Constructed", value: "18", note: "Urban and feeder routes" },
  { label: "Health Facilities", value: "4", note: "Clinics and CHPS upgrades" },
  { label: "Water Projects", value: "22", note: "Boreholes and solar systems" },
  { label: "Youth Programs", value: "31", note: "Skills, sports, jobs" },
  { label: "Beneficiaries", value: "120k+", note: "Residents reached" },
];

export const impactStats = [
  { value: "15", label: "Schools Built" },
  { value: "22", label: "Boreholes" },
  { value: "4", label: "Health Centers" },
  { value: "18", label: "Roads" },
  { value: "25k", label: "Students Benefited" },
  { value: "120k", label: "Citizens Served" },
];

export const news = [
  {
    title: "Road asphalt works reach Ahenfie Market junction",
    category: "Project Update",
    date: "28 Jun 2026",
    readTime: "3 min read",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "The second phase of asphalt works is improving access for traders, transport operators, and emergency vehicles.",
  },
  {
    title: "Clinic equipment procurement enters final evaluation",
    category: "Health",
    date: "24 Jun 2026",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Maternity, triage, and laboratory equipment packages have been shortlisted for the Nkwanta clinic expansion.",
  },
  {
    title: "Youth digital work hub completes site validation",
    category: "Youth",
    date: "15 Jun 2026",
    readTime: "2 min read",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "The proposed hub is designed to connect training, mentorship, remote work readiness, and youth enterprise support.",
  },
];

export const events = [
  {
    title: "Quarterly Town Hall",
    date: "18 Jul 2026",
    location: "Ahenfie Civic Hall",
    type: "Town Hall",
  },
  {
    title: "Mobile Health Outreach",
    date: "26 Jul 2026",
    location: "Nkwanta Clinic",
    type: "Health Outreach",
  },
  {
    title: "STEM Mentorship Day",
    date: "09 Aug 2026",
    location: "Adom New Town School",
    type: "Education",
  },
  {
    title: "Market Safety Forum",
    date: "21 Aug 2026",
    location: "Anidaso Market",
    type: "Community Safety",
  },
];

export const testimonials = [
  {
    name: "Nana Kofi Adu",
    role: "Traditional Leader",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    quote:
      "The project tracker has made public works visible. Our community can see the budget, timeline, and the next milestone.",
  },
  {
    name: "Mavis Ofori",
    role: "Headteacher",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    quote:
      "The new classroom block changed the rhythm of the school day. Students now have space, labs, and proper washrooms.",
  },
  {
    name: "Kojo Mensah",
    role: "Youth Organizer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    quote:
      "The youth programs are practical. They connect training with real jobs, mentors, and tools we can actually use.",
  },
];

export const mediaItems = [
  { label: "Videos", count: "42" },
  { label: "Press Releases", count: "68" },
  { label: "Photo Gallery", count: "310" },
  { label: "Interviews", count: "24" },
  { label: "Downloads", count: "19" },
  { label: "Podcast", count: "12" },
];

export const faqs = [
  {
    question: "How often are project updates published?",
    answer:
      "Ongoing projects are reviewed every two weeks, while completed and planned projects are updated whenever audits, procurement decisions, or public notices are available.",
  },
  {
    question: "Can residents suggest a project?",
    answer:
      "Yes. Residents can submit requests through the contact form, town halls, assembly members, or the constituency office.",
  },
  {
    question: "Where do budget figures come from?",
    answer:
      "Budget figures are compiled from approved project documents, partner funding notices, assembly records, and MP Common Fund allocations.",
  },
  {
    question: "How are stalled projects handled?",
    answer:
      "Stalled projects are marked clearly with the reason, latest action, responsible stakeholder, and expected next decision point.",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
