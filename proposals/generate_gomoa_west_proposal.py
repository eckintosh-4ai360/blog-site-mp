from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).parent
OUTPUT = ROOT / "output" / "Gomoa-West-Constituency-Portal-Proposal.pdf"

NAVY = colors.HexColor("#0B2240")
GREEN = colors.HexColor("#115E59")
GOLD = colors.HexColor("#DCA939")
INK = colors.HexColor("#18283B")
MUTED = colors.HexColor("#4E5B6E")
PALE = colors.HexColor("#F2F5F7")
PALE_GREEN = colors.HexColor("#E7F2EF")
LINE = colors.HexColor("#DBE2EB")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="Kicker", fontName="Helvetica-Bold", fontSize=8.8, leading=11,
    textColor=GREEN, spaceAfter=8, tracking=1.25,
))
styles.add(ParagraphStyle(
    name="CoverTitle", fontName="Helvetica-Bold", fontSize=31, leading=35,
    textColor=NAVY, spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="CoverSub", fontName="Helvetica", fontSize=14.5, leading=21,
    textColor=MUTED, spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="H1Proposal", fontName="Helvetica-Bold", fontSize=20, leading=24,
    textColor=NAVY, spaceBefore=0, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="H2Proposal", fontName="Helvetica-Bold", fontSize=12.3, leading=15,
    textColor=GREEN, spaceBefore=13, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodyProposal", fontName="Helvetica", fontSize=9.6, leading=14.4,
    textColor=INK, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="BulletProposal", fontName="Helvetica", fontSize=9.3, leading=13.4,
    textColor=INK, leftIndent=13, firstLineIndent=-9, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="Callout", fontName="Helvetica-Bold", fontSize=11.2, leading=16,
    textColor=NAVY, alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="Small", fontName="Helvetica", fontSize=8.1, leading=11,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="TableHead", fontName="Helvetica-Bold", fontSize=8.2, leading=10,
    textColor=colors.white,
))
styles.add(ParagraphStyle(
    name="TableCell", fontName="Helvetica", fontSize=8.1, leading=10.7,
    textColor=INK,
))


def p(text, style="BodyProposal"):
    return Paragraph(escape(text).replace("\n", "<br/>"), styles[style])


def rich(text, style="BodyProposal"):
    return Paragraph(text, styles[style])


def bullets(items):
    return [rich(f"•&nbsp;&nbsp;{escape(item)}", "BulletProposal") for item in items]


def callout(text):
    return Table([[p(text, "Callout")]], colWidths=[170 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_GREEN),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#BED9D1")),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))


def section(title, body=None):
    result = [p(title, "H1Proposal"), HRFlowable(width="100%", thickness=1, color=GOLD, spaceAfter=12)]
    if body:
        result.append(p(body))
    return result


def data_table(headers, rows, widths):
    data = [[p(x, "TableHead") for x in headers]]
    for row in rows:
        data.append([p(x, "TableCell") for x in row])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 10 * mm, width, 10 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.drawString(20 * mm, height - 6.5 * mm, "GOMOA WEST CONSTITUENCY DIGITAL PLATFORM")
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(width - 20 * mm, height - 6.5 * mm, "Confidential proposal | 29 October 2026")
    canvas.setStrokeColor(LINE)
    canvas.line(20 * mm, 13 * mm, width - 20 * mm, 13 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(20 * mm, 8.5 * mm, "Prepared for the Office of the MP, Gomoa West")
    canvas.drawRightString(width - 20 * mm, 8.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4,
        rightMargin=20 * mm, leftMargin=20 * mm,
        topMargin=22 * mm, bottomMargin=19 * mm,
        title="Gomoa West Constituency Portal Proposal",
        author="Constituency Digital Platform Team",
    )
    story = []

    # Cover
    story += [Spacer(1, 24 * mm), p("DIGITAL ACCOUNTABILITY & ENGAGEMENT PLATFORM", "Kicker"),
              p("Gomoa West\nConstituency Portal", "CoverTitle"),
              p("A practical proposal to make constituency delivery visible, verifiable, and easier for residents to engage with.", "CoverSub"),
              Spacer(1, 3 * mm), HRFlowable(width="100%", thickness=2.3, color=GOLD, spaceAfter=14),
              p("PREPARED FOR", "Kicker"),
              p("Hon. Richard Gyan-Mensah", "H1Proposal"),
              p("Member of Parliament, Gomoa West", "CoverSub"),
              Spacer(1, 28 * mm),
              callout("A resident should be able to see what is planned, what is underway, what has been delivered, and how to participate."),
              Spacer(1, 18 * mm),
              p("Prepared by: Constituency Digital Platform Team\n29 October 2026", "Small"), PageBreak()]

    # Executive proposition
    story += section("Executive proposition")
    story += [p("This proposal adapts the proven structure of the existing Tarkwa Nsuaem public-service portal into a dedicated Gomoa West Constituency Portal. It is not a template website or a campaign microsite. It is a governed, public-facing operating system for communicating delivery, maintaining an evidence-led project record, and receiving structured feedback from residents."),
              p("The platform gives the Office of the MP one trusted digital home for project updates, community activity, media, constituency information, and public enquiries. It is designed to complement—not replace—formal government, Assembly, procurement, or parliamentary records."),
              p("The decision requested", "H2Proposal"),
              p("Approve a 10-day discovery and content-verification sprint, nominate the office owners, and select five pilot projects or programmes. On that basis, the platform can be configured, populated, and launched in a controlled 12-week rollout."),
              p("What Gomoa West receives", "H2Proposal")]
    story += bullets([
        "A distinctly Gomoa West branded website for projects, news, events, gallery, impact, and contact.",
        "A searchable public project archive with community, category, year, status, and budget filters.",
        "Individual project pages with source, funding, milestones, progress, images, updates, documents, and before-and-after evidence where appropriate.",
        "A protected admin workspace that lets the constituency office publish and correct content without relying on a developer for routine updates.",
        "A governance rhythm, launch plan, staff training, and a measurable first-90-day adoption scorecard.",
    ])
    story += [p("The core principle", "H2Proposal"),
              callout("No Tarkwa Nsuaem project information, figures, names, or images should be presented as Gomoa West content. The existing system supplies the delivery model and interface components; all Gomoa West records must be verified locally before publication."), PageBreak()]

    # Why
    story += section("Why this matters for Gomoa West")
    story += [p("Constituency work is often visible in communities but fragmented online: updates may sit across conversations, flyers, photos, WhatsApp groups, and separate social accounts. That makes it difficult for residents to follow a project from commitment through delivery, and it makes routine questions unnecessarily hard for the office to manage."),
              p("A single transparent portal improves the experience on both sides. Residents can self-serve for current, factual information; the office can publish once, link everywhere, and retain a structured record of delivery over time."),
              p("Outcomes the platform is designed to create", "H2Proposal")]
    story += bullets([
        "Trust through clarity: show project stage, last update date, evidence, and the responsible delivery partner where disclosure is appropriate.",
        "Better engagement: make it simple to find office contact channels, town halls, community events, and ways to submit a request.",
        "Stronger office operations: replace scattered information with one editorial workflow and a repeatable update cadence.",
        "Useful evidence for advocacy: aggregate the visible delivery record and resident demand signals into a clearer briefing base for the MP and partners.",
        "A durable constituency asset: the public record continues beyond individual announcements and is managed by the office, not by a single social-media account.",
    ])
    story += [p("Positioning", "H2Proposal"),
              p("The portal should be introduced as the official digital information and engagement hub of the Office of the MP for Gomoa West. Its tone should be service-led, factual, and non-exclusionary: residents see what is known, what is pending, and how to participate."), PageBreak()]

    # Capabilities
    story += section("The Gomoa West portal: capabilities to adopt", "The current platform already contains the functional foundation below. The Gomoa West rollout configures its identity, replaces all demonstration records with verified local content, and sets office routines around it.")
    capabilities = [
        ("1. Public delivery dashboard", "Homepage summary of verified priorities, project status, community reach, and recent activity. A project archive can be filtered by community, sector, year, stage, and budget range. Each profile can hold objectives, sources, milestones, delivery evidence, risks, and next actions."),
        ("2. Communications and participation", "News and press updates; an events calendar for town halls, outreach, stakeholder meetings, and programmes; a photo/video/document gallery; downloadable notices; contact and feedback routes; and an FAQ section for repeat questions."),
        ("3. Managed office operations", "Secure administrator access, content forms, image upload support, category management, and structured fields that standardise the facts collected for every project. The office controls a draft, verify, approve, publish, review workflow."),
    ]
    for heading, text in capabilities:
        story += [p(heading, "H2Proposal"), p(text)]
    story += [p("Content architecture for launch", "H2Proposal"),
              p("Initial navigation: Home | About the MP | Priorities | Projects | News | Events | Gallery | Impact | Contact. Optional additions after discovery include a scholarships/programmes hub, a community directory, frequently requested letters/forms, and a language-access plan."), PageBreak()]

    # Plan
    story += section("12-week adoption plan")
    plan_rows = [
        ("1–2", "Discover & govern", "Working session; agree purpose, audiences, content rules, approval authority and escalation path; create verified master inventory; select five pilot records."),
        ("3–5", "Configure & populate", "Apply Gomoa West identity, domain and contacts; migrate verified pilot records; prepare news, events, FAQs and media; configure taxonomy and an update template."),
        ("6–8", "Test & pilot", "Train office users through real publishing; check mobile usability, accuracy, permissions and accessibility; invite a small community review group."),
        ("9–12", "Launch & embed", "Town-hall demonstration; QR cards/posters and WhatsApp-ready links; publish first monthly update; review usage and content quality."),
    ]
    story.append(data_table(["Weeks", "Phase", "Activities & outputs"], plan_rows, [19 * mm, 39 * mm, 112 * mm]))
    story += [Spacer(1, 8), p("Phase 1: specific deliverables", "H2Proposal")]
    story += bullets([
        "A local content and data governance standard, including a named owner for each public record.",
        "A pilot list that demonstrates a useful range of sectors or programme stages and has adequate evidence to publish.",
        "A launch backlog separating what is ready now from records awaiting verification—so the platform begins credibly.",
    ])
    story += [p("Launch method", "H2Proposal"), p("Launch with a live demonstration at a town hall or office event, a short explainer visual, QR cards/posters in high-footfall locations, and direct links shared through approved community and WhatsApp channels. The first public post should explain what the portal can and cannot answer, and how residents can report an inaccuracy."), PageBreak()]

    # Operating
    story += section("Operating model: make it credible", "The technology is the easy part. The value comes from disciplined, named ownership of the information that residents see. The proposal therefore builds the platform and the routine together.")
    roles = [
        ("Executive sponsor", "MP", "Approves direction, public commitments, and sensitive corrections."),
        ("Portal owner", "Constituency office lead", "Owns the editorial calendar, workflow, and weekly publication readiness."),
        ("Data stewards", "Project/programme focal persons", "Verify status, location, partner/source, evidence, and next milestone."),
        ("Communications editor", "Communications lead", "Prepares resident-friendly stories, photography, event notices, and social distribution."),
        ("Technical administrator", "Platform support", "Manages access, support, backups, and major platform updates."),
    ]
    story.append(data_table(["Role", "Suggested owner", "Accountability"], roles, [38 * mm, 47 * mm, 85 * mm]))
    story += [p("Minimum publishing standard", "H2Proposal")]
    story += bullets([
        "Every project page has a named data owner and a last-verified date.",
        "Ongoing projects are reviewed at least every 14 days; planned, completed, or stalled records are updated when a material decision occurs.",
        "Unconfirmed figures are not published as facts. Where a funding amount or date is unavailable, the portal states that it is pending verification.",
        "Sensitive personal data, private requests, and images without appropriate consent remain off the public site.",
        "A correction path is visible: residents can flag an inaccuracy, and the office logs and resolves it through the approval workflow.",
    ])
    story += [p("Engagement rhythm", "H2Proposal"), p("Weekly: editorial check-in and priority enquiries. Fortnightly: active-project status review. Monthly: public round-up and dashboard update. Quarterly: town hall or community review that uses the portal record as a common reference point."), PageBreak()]

    # Measures
    story += section("Success measures and safeguards")
    story += [p("First-90-day scorecard", "H2Proposal")]
    score_rows = [
        ("Coverage", "100% of launch inventory has a data owner and last-verified date."),
        ("Evidence", "At least 85% of selected priority records are supported by a verifiable source, document, or approved field evidence."),
        ("Freshness", "90% of active-project updates are published within the agreed 14-day review window."),
        ("Responsiveness", "90% of public enquiries are acknowledged within two working days, even where the substantive answer needs longer."),
        ("Adoption", "A baseline of visits, searches, requests, and event clicks is established by the end of month one; targets then use actual behaviour."),
    ]
    story.append(data_table(["Measure", "90-day target"], score_rows, [39 * mm, 131 * mm]))
    story += [p("Safeguards", "H2Proposal"),
              p("Accuracy: use a source and approval check before publication. Privacy: do not expose sensitive casework or children’s information; obtain appropriate consent for recognisable images. Security: least-privilege admin access and regular access review. Continuity: assign at least two trained editors and retain the verified source record behind each published claim."),
              p("What is deliberately out of scope for launch", "H2Proposal"),
              p("The first release should not attempt to digitise every constituency record or promise a public answer to every complex case. It prioritises a clean, credible foundation: verified information, the most useful resident journeys, trained office owners, and a dependable update rhythm. Additional services can be added after the pilot is stable."),
              p("Implementation prerequisites", "H2Proposal")]
    story += bullets([
        "Approved name, visual identity, portrait/biography, and official contact channels.",
        "Five verified pilot project/programme records, associated evidence, and permissions to use media.",
        "Nomination of the portal owner, data stewards, and communications editor.",
        "A launch date and approval to run the discovery session.",
    ])
    story.append(PageBreak())

    # Close
    story += section("Recommended next steps")
    story += [p("The proposed next move is modest and decisive: start with a discovery sprint, use it to settle governance and content quality, then launch a focused pilot that can grow without losing credibility."),
              p("Week-one action list", "H2Proposal")]
    story += bullets([
        "Confirm sponsorship from the Office of the MP and name the four operating roles.",
        "Schedule the half-day discovery workshop.",
        "Share available project/programme lists, public notices, reports, photos, and event calendars for verification.",
        "Choose five pilot records representing priority areas and different stages of delivery.",
        "Approve the public positioning: Gomoa West’s official information and engagement hub.",
    ])
    story += [p("Closing statement", "H2Proposal"),
              p("Gomoa West does not need to begin from a blank page. The functional foundation already exists. What will make this adoption successful is a careful localisation process: verified Gomoa West content, clear office ownership, a resident-first launch, and a reliable public record that earns trust over time."),
              Spacer(1, 7),
              callout("Proposed outcome: a trusted digital front door for the Office of the MP and a transparent, living record of constituency delivery."),
              Spacer(1, 15),
              p("REFERENCE NOTE", "Kicker"),
              p("The recipient designation used in this proposal is based on the Parliament of Ghana member record for Hon. Richard Gyan-Mensah, Member of Parliament for Gomoa West, accessed 29 October 2026: parliament.gh/members?mp=94013. All future Gomoa West project, programme, budget, impact, and media content should be verified by the constituency office before publication.", "Small")]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


if __name__ == "__main__":
    build()
    print(OUTPUT)
