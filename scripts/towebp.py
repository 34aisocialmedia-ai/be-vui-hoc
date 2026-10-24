import sys, os, glob, json
from PIL import Image
src_root, out_root = sys.argv[1], sys.argv[2]
# Longest side limits chosen from on-screen use (retina included).
LIMITS = {
  'images/mascot_rabbit.png': 512,            # shown at 90–120 px
  'images/play-garden-3d.png': 1280,          # hero banner
  'images/music-playroom-3d.png': 1280,
  'images/bear-animation-3d.png': None,       # sprite sheets: keep exact frame grid
  'images/friends-animation-3d.png': None,
  'images/food-realistic-atlas.png': None,
}
DEFAULT = {'images': 1024, 'objects': 512, 'covers': 768, 'photos': 800}
report = []
for f in sorted(glob.glob(os.path.join(src_root, '*/*.png')) + glob.glob(os.path.join(src_root, '*/*.jpg'))):
    rel = os.path.relpath(f, src_root).replace('\\', '/')
    folder = rel.split('/')[0]
    limit = LIMITS.get(rel, DEFAULT[folder])
    im = Image.open(f)
    im.load()
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGBA' if 'A' in im.getbands() or 'transparency' in im.info else 'RGB')
    w, h = im.size
    if limit and max(w, h) > limit:
        s = limit / max(w, h)
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    out = os.path.join(out_root, os.path.splitext(rel)[0] + '.webp')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    q = 82 if folder in ('photos', 'covers') else 85
    im.save(out, 'WEBP', quality=q, method=6)
    report.append((rel, f'{w}x{h}', f'{im.size[0]}x{im.size[1]}', os.path.getsize(f), os.path.getsize(out)))
t0 = sum(r[3] for r in report); t1 = sum(r[4] for r in report)
for r in report: print(f'{r[0]:42s} {r[1]:>10s} -> {r[2]:>10s} {r[3]/1e3:7.0f} KB -> {r[4]/1e3:5.0f} KB')
print(f'{len(report)} files: {t0/1e6:.2f} MB -> {t1/1e6:.2f} MB ({100-100*t1/t0:.0f}% smaller)')
