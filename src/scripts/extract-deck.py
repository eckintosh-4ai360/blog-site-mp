import zipfile, os, re

PPTX = "public/MPs projects in progressess.pptx"
OUT  = "public/deck-projects"


# Appear on all 56 slides -> template logo/banner/background, not project photos.
# image24 is a 10KB "Project Sponsor" badge reused on two slides.
CHROME = {"image7.png", "image9.PNG", "image10.png", "image24.jpg",
          "image8.png", "image11.png", "image12.png"}

# (slug, slide numbers) or (slug, slide numbers, only these media files) when a
# single slide covers two separate projects.
GROUPS = [
    ("reshaping-inner-link-roads",      [3, 4, 5, 6, 7, 8]),
    ("sanitation-refuse-excavation",    [9, 12]),
    ("dustbin-donation-tarkwa-station",  [11]),
    # Slides 10 and 53 carry identical title text, but only slide 53 shows the
    # sod-cutting — slide 10's photos are a refuse dump being cleared.
    ("refuse-dump-evacuation",          [10]),
    ("tarkwa-zongo-water-closet",       [53]),
    ("network-connectivity-expansion",  [13]),
    ("agricultural-tools-supply",       [14]),
    ("palm-coconut-seedlings",          [15]),
    ("nkoko-nkitinkiti-poultry",        [16]),
    ("medeama-sc-sports-support",       [17]),
    ("breast-cancer-screening-esuaso",  [18]),
    ("health-equipment-donation",       [19]),
    # Slide 20 covers two separate interventions: desks sent across the whole
    # constituency, and one classroom block built only at Dompim.
    ("school-desks-distribution",        [20], ["image65.jpg"]),
    ("classroom-block-dompim",           [20], ["image66.jpg"]),
    ("islamic-shs-simpa",               [21, 22]),
    ("student-fees-support",            [23]),
    ("mp-interest-free-loans",          [24, 25]),
    ("transformer-replacement",         [26, 27]),
    ("street-lighting-project",         [28, 55]),
    ("youth-unemployment-programmes",   [29, 30, 31, 32]),
    ("skills-training-simulators",      [33, 34, 35]),
    ("youth-in-driving",                [36, 37]),
    ("borehole-drilling",               [38, 39]),
    ("anti-illegal-mining-support",     [40, 41, 42, 43, 44, 45, 46]),
    ("cement-donations",                [47]),
    ("creative-art-support",            [48, 49, 50]),
    ("media-personalities-support",     [51, 52]),
    ("ghana-card-registration",         [54]),
]

def read_slides():
    """slide number -> {'text': [...], 'images': [...]} straight from the pptx."""
    A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
    import xml.etree.ElementTree as ET
    out = {}
    for name in z.namelist():
        m = re.match(r"ppt/slides/slide(\d+)\.xml$", name)
        if not m:
            continue
        i = int(m.group(1))
        root = ET.fromstring(z.read(name))
        text = [t.text.strip() for t in root.iter(A + "t") if t.text and t.text.strip()]
        imgs = []
        rel = "ppt/slides/_rels/slide%d.xml.rels" % i
        if rel in z.namelist():
            for tgt in re.findall(r'Target="[^"]*media/([^"]+)"', z.read(rel).decode()):
                if tgt not in imgs:
                    imgs.append(tgt)
        out[i] = {"text": text, "images": imgs}
    return out

def add_smartart_images(slides):
    """Some slides (9, 27, 39) put their photos inside a SmartArt diagram. Those
    images hang off ppt/diagrams/_rels, not the slide's own rels, so walking the
    slide alone silently loses them."""
    for i, slide in slides.items():
        rel = "ppt/slides/_rels/slide%d.xml.rels" % i
        if rel not in z.namelist():
            continue
        parts = re.findall(r'Target="\.\./diagrams/(data\d+|drawing\d+)\.xml"',
                           z.read(rel).decode())
        for part in sorted(set(parts)):
            drel = "ppt/diagrams/_rels/%s.xml.rels" % part
            if drel not in z.namelist():
                continue
            for tgt in re.findall(r'Target="[^"]*media/([^"]+)"',
                                  z.read(drel).decode()):
                if tgt not in slide["images"]:
                    slide["images"].append(tgt)


z = zipfile.ZipFile(PPTX)
media = {os.path.basename(n): n for n in z.namelist() if "/media/" in n}
slides = read_slides()
add_smartart_images(slides)

summary = []
used = set()
for group in GROUPS:
    slug, nums = group[0], group[1]
    only = group[2] if len(group) > 2 else None
    imgs = []
    for n in nums:
        for img in slides[n]["images"]:
            if img in CHROME or img in imgs:
                continue
            if only is not None and img not in only:
                continue
            imgs.append(img)
    d = os.path.join(OUT, slug)
    os.makedirs(d, exist_ok=True)
    for idx, img in enumerate(imgs, 1):
        ext = os.path.splitext(img)[1].lower()
        if ext == ".jpeg":
            ext = ".jpg"
        dest = os.path.join(d, "%02d%s" % (idx, ext))
        with open(dest, "wb") as f:
            f.write(z.read(media[img]))
        used.add(img)
    mb = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d)) / 1e6
    summary.append((slug, nums, len(imgs), mb))
    print("%-34s slides %-22s %2d photos  %6.1f MB" % (slug, str(nums), len(imgs), mb))

print()
print("projects:", len(summary))
print("photos extracted:", len(used))
print("total MB: %.0f" % sum(s[3] for s in summary))
orphan = [m for m in media if m not in used and m not in CHROME and not m.endswith(".wdp")]
print("unreferenced media not extracted:", len(orphan))

